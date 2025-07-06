import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import json
import time

def get_page_content(url, headers, retries=3, delay=2):
    """
    Récupère le contenu HTML d'une URL donnée avec gestion des erreurs et des tentatives.
    """
    for i in range(retries):
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Lever une HTTPError pour les mauvaises réponses (4xx ou 5xx)
            return response.text
        except requests.exceptions.RequestException as e:
            print(f"Erreur lors de la récupération de l'URL {url} (tentative {i+1}/{retries}): {e}")
            if i < retries - 1:
                time.sleep(delay * (i + 1)) # Augmenter le délai à chaque échec
            else:
                print(f"Échec après {retries} tentatives pour l'URL: {url}")
                return None

def parse_job_listings_from_html(html_content):
    """
    Parse le contenu HTML d'une page emploi.ma et extrait les données des offres d'emploi.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    job_offers_data = []
    base_domain = "https://www.emploi.ma"

    job_cards = soup.find_all('div', class_='card-job')

    if not job_cards:
        print("Aucune offre d'emploi trouvée avec le sélecteur 'div.card-job' sur cette page.")
        return []

    print(f"Traitement de {len(job_cards)} offres trouvées sur cette page.")

    for card in job_cards:
        offer = {
            'offer_id': None,
            'flexible_hours': None,
            'study_level': None,
            'basic_salary': None,
            'company_name': None,
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'date_expiration': None,
            'date_publication': None,
            'description': None,
            'experience': None,
            'location': None,
            'modality': 'Notspecified', # Default
            'sector_activity': None,
            'skills': None,
            'status': 'ACTIVE', # Default status
            'title': None,
            'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'manager_id': None,
            'offer_url': None
        }

        # 1. Offer URL and Offer ID
        offer_url = card.get('data-href')
        if offer_url:
            offer['offer_url'] = offer_url
            match = re.search(r'-(\d+)$', offer_url)
            if match:
                offer['offer_id'] = int(match.group(1))

        # 2. Title
        title_tag = card.find('h3')
        if title_tag and title_tag.a:
            offer['title'] = title_tag.a.get_text(strip=True)

        # 3. Company Name
        company_tag = card.find('a', class_='card-job-company')
        if company_tag:
            offer['company_name'] = company_tag.get_text(strip=True)

        # 4. Description
        description_tag = card.find('div', class_='card-job-description')
        if description_tag and description_tag.p:
            offer['description'] = description_tag.p.get_text(strip=True)

        # 5. Publication Date
        time_tag = card.find('time')
        if time_tag and 'datetime' in time_tag.attrs:
            try:
                # The format on emploi.ma is 'YYYY-MM-DD' for date_publication
                offer['date_publication'] = datetime.strptime(time_tag['datetime'], '%Y-%m-%d').strftime('%Y-%m-%d')
            except ValueError:
                offer['date_publication'] = None
        
        # created_at and updated_at can be the same as date_publication if available,
        # otherwise use current time as default (already set at initialization)
        if offer['date_publication']:
            offer['created_at'] = f"{offer['date_publication']} 00:00:00" # Assuming start of day
            offer['updated_at'] = f"{offer['date_publication']} 00:00:00"


        # 6. Extract details from the <ul> list (experience, study_level, location, skills)
        detail_items = card.find_all('li')
        for item in detail_items:
            item_text = item.get_text(strip=True)

            if 'Niveau d´études requis :' in item_text:
                offer['study_level'] = item_text.replace('Niveau d´études requis :', '').strip()
            elif 'Niveau d\'expérience :' in item_text:
                offer['experience'] = item_text.replace('Niveau d\'expérience :', '').strip()
            elif 'Région de :' in item_text:
                offer['location'] = item_text.replace('Région de :', '').strip()
            elif 'Compétences clés :' in item_text:
                offer['skills'] = item_text.replace('Compétences clés :', '').strip()
            
            # Modality is not explicitly mentioned as 'Télétravail' but as contract type.
            # We'll leave it as 'Notspecified' unless we can reliably infer it from other cues.
            # For this example, we keep 'Notspecified' as per your initial table definition.
            # If "CDI & CDD" implies onsite by default for this site, then logic could be added here.
            # For now, it's safer to leave as Notspecified if no clear remote/hybrid/onsite text is found.

    
        job_offers_data.append(offer)

    return job_offers_data

def scrape_all_emploi_ma_job_offers(base_url):
    """
    Scrape toutes les pages d'offres d'emploi de emploi.ma avec pagination.
    """
    all_scraped_data = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=09',
        'Referer': 'https://www.google.com/'
    }

    current_page_param = 0 # emploi.ma uses ?page=0 for the second page, ?page=1 for the third, etc.
                           # The first page has no ?page parameter.
    last_page = None

    while True:
        # Construct the URL for the current page
        if current_page_param == 0:
            page_url = base_url
        else:
            page_url = f"{base_url}?page={current_page_param}"

        print(f"Récupération de la page: {page_url}")
        html_content = get_page_content(page_url, headers)

        if not html_content:
            print(f"Impossible de récupérer le contenu de la page {page_url}. Arrêt du scraping.")
            break

        soup = BeautifulSoup(html_content, 'html.parser')

        # Determine the last page on the first iteration
        if last_page is None:
            pagination_div = soup.find('div', class_='pagination')
            if pagination_div:
                # Find the link to the last page (e.g., "27" in your example, which has page=26)
                last_page_link = pagination_div.find('li', class_='pager-item active pagination-numbers', title="Aller à la dernière page")
                if last_page_link and last_page_link.a and 'href' in last_page_link.a.attrs:
                    last_page_href = last_page_link.a['href']
                    match = re.search(r'page=(\d+)', last_page_href)
                    if match:
                        last_page = int(match.group(1))
                        print(f"Dernière page détectée (paramètre 'page'): {last_page}")
                    else:
                        print("Impossible d'extraire le numéro de la dernière page. Assumer une page unique.")
                        last_page = 0 # Default to 0 if only one page or structure changed
                else:
                    # Fallback if specific "Aller à la dernière page" not found
                    # Check if there are any other page links, if not, assume single page
                    other_page_links = pagination_div.find_all('li', class_='pager-item active pagination-numbers')
                    if other_page_links:
                        # Get the highest page number from visible links
                        max_page_found = 0
                        for link_li in other_page_links:
                            if link_li.a and 'href' in link_li.a.attrs:
                                href_match = re.search(r'page=(\d+)', link_li.a['href'])
                                if href_match:
                                    max_page_found = max(max_page_found, int(href_match.group(1)))
                        if max_page_found > 0:
                            last_page = max_page_found
                            print(f"Dernière page détectée via autres liens (paramètre 'page'): {last_page}")
                        else:
                            print("Aucun lien de page trouvé pour déterminer la dernière page. Assumer une page unique.")
                            last_page = 0
            else:
                print("Div de pagination non trouvé. Assumer une page unique.")
                last_page = 0 # No pagination implies only one page

        # Parse job listings from the current page
        current_page_offers = parse_job_listings_from_html(html_content)
        all_scraped_data.extend(current_page_offers)

        # Check if we should continue to the next page
        if not current_page_offers: # No jobs on this page, likely end of results
            print("Aucune nouvelle offre trouvée sur cette page. Fin du scraping.")
            break
        
        if last_page is not None and current_page_param >= last_page:
            print(f"Atteint la dernière page ({last_page}). Fin du scraping.")
            break
        
        # If last_page was determined as 0 (single page), break after first iteration
        if last_page == 0 and current_page_param == 0 and not current_page_offers:
            print("Probablement une page unique sans autres résultats. Fin du scraping.")
            break
        
        # If last_page was correctly found, increment current_page_param to go to the next page
        current_page_param += 1
        time.sleep(2) # Be polite: Add a delay between page requests

    return all_scraped_data

if __name__ == '__main__':
    emploi_ma_base_url = "https://www.emploi.ma/recherche-jobs-maroc"

    scraped_data = scrape_all_emploi_ma_job_offers(emploi_ma_base_url)

    if scraped_data:
        output_filename = "emploi_ma_all_job_offers.json"
        try:
            with open(output_filename, 'w', encoding='utf-8') as f:
                json.dump(scraped_data, f, ensure_ascii=False, indent=4)
            print(f"Successfully scraped {len(scraped_data)} job offers and saved to '{output_filename}'.")
        except IOError as e:
            print(f"Error saving data to file '{output_filename}': {e}")
    else:
        print("No data scraped. Check the URL, network connectivity, or if the website blocked the request.")
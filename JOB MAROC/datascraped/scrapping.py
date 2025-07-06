import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import json
import time # Importer le module time pour les délais

def get_page_content(url, headers, retries=3, delay=2):
    """
    Récupère le contenu HTML d'une URL donnée avec gestion des erreurs et des tentatives.
    """
    for i in range(retries):
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Corrected: Lever une HTTPError pour les mauvaises réponses (4xx ou 5xx)
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
    Parse le contenu HTML d'une page et extrait les données des offres d'emploi.
    Cette fonction est désormais personnalisée pour les étiquettes de texte en ANGLAIS.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    job_offers_data = []
    base_domain = "https://www.rekrute.com" # Define base domain for constructing full URLs

    job_listings = soup.find_all('li', class_='post-id')

    if not job_listings:
        print("Aucune offre d'emploi trouvée avec le sélecteur 'li.post-id' sur cette page. (Ceci peut être dû à un blocage ou un changement de structure)")
        return []

    # --- CHANGE 1: REMOVED THE 5-ITEM LIMIT ---
    # The code will now loop through all job_listings found on the page.
    print(f"Traitement de {len(job_listings)} offres trouvées sur cette page.")

    for job in job_listings: # Now iterates over all found listings
        offer = {}

        # 1. Offer ID
        offer['offer_id'] = int(job.get('id')) if job.get('id') else None

        # 2. Title, Location, and Offer URL
        title_tag = job.find('a', class_='titreJob')
        if title_tag:
            # --- CHANGE 2: GET THE OFFER URL ---
            relative_url = title_tag.get('href')
            offer['offer_url'] = f"{base_domain}{relative_url}" if relative_url else None
            
            full_title_location = title_tag.get_text(strip=True)
            if '|' in full_title_location:
                parts = full_title_location.split('|')
                offer['title'] = parts[0].strip()
                offer['location'] = parts[1].strip()
            else:
                offer['title'] = full_title_location
                offer['location'] = None
        else:
            offer['offer_url'] = None
            offer['title'] = None
            offer['location'] = None

        # 3. Company Name
        company_logo_img = job.find('img', class_='photo')
        if company_logo_img and company_logo_img.get('alt'):
            offer['company_name'] = company_logo_img.get('alt').strip()
        else:
            company_link = job.find('a', href=re.compile(r'/en/[^/]+-emploi-recrutement-\d+\.html'))
            if company_link:
                offer['company_name'] = company_link.get_text(strip=True)
            else:
                offer['company_name'] = 'Confidentiel' if 'Confidentiel' in str(job) else None

        # 4. Description
        info_divs = job.find('div', class_='holder')
        description_parts = []
        if info_divs:
            for info_span in info_divs.find_all('span', style=re.compile(r'color: #5b5b5b;')):
                description_parts.append(info_span.get_text(strip=True))
            offer['description'] = "\n\n".join(description_parts) if description_parts else None
        else:
            offer['description'] = None

        # 5. Publication Date and Expiration Date
        date_em_tag = job.find('em', class_='date')
        if date_em_tag:
            date_spans = date_em_tag.find_all('span')
            if len(date_spans) >= 2:
                try:
                    offer['date_publication'] = datetime.strptime(date_spans[0].get_text(strip=True), '%d/%m/%Y').strftime('%Y-%m-%d')
                    offer['date_expiration'] = datetime.strptime(date_spans[1].get_text(strip=True), '%d/%m/%Y').strftime('%Y-%m-%d')
                    offer['created_at'] = datetime.strptime(date_spans[0].get_text(strip=True), '%d/%m/%Y').strftime('%Y-%m-%d %H:%M:%S')
                except ValueError:
                    offer['date_publication'] = None
                    offer['date_expiration'] = None
                    offer['created_at'] = None
            else:
                offer['date_publication'] = None
                offer['date_expiration'] = None
                offer['created_at'] = None
        else:
            offer['date_publication'] = None
            offer['date_expiration'] = None
            offer['created_at'] = None

        # 6. Experience Required
        experience_li = job.find(lambda tag: tag.name == 'li' and 'Experience required :' in tag.get_text())
        if experience_li:
            experience_a = experience_li.find('a')
            offer['experience'] = experience_a.get_text(strip=True) if experience_a else None
        else:
            offer['experience'] = None

        # 7. Study Level
        study_level_li = job.find(lambda tag: tag.name == 'li' and "Level of study required :" in tag.get_text())
        if study_level_li:
            study_level_a = study_level_li.find('a')
            offer['study_level'] = study_level_a.get_text(strip=True) if study_level_a else None
        else:
            offer['study_level'] = None

        # 8. Sector of Activity
        sector_activity_li = job.find(lambda tag: tag.name == 'li' and "Sector of activity :" in tag.get_text())
        if sector_activity_li:
            sectors = [a.get_text(strip=True) for a in sector_activity_li.find_all('a')]
            offer['sector_activity'] = " / ".join(sectors) if sectors else None
        else:
            offer['sector_activity'] = None

        # 9. Modality and Flexible Hours
        contract_type_li = job.find(lambda tag: tag.name == 'li' and "Type of contract proposed :" in tag.get_text())
        if contract_type_li:
            contract_text = contract_type_li.get_text(strip=True)
            if "Télétravail : No" in contract_text or "Telework : No" in contract_text:
                offer['modality'] = 'OnSite'
                offer['flexible_hours'] = 0
            elif "Télétravail : Hybride" in contract_text or "Telework : Hybrid" in contract_text:
                offer['modality'] = 'Hybrid'
                offer['flexible_hours'] = 1
            elif "Télétravail : Yes" in contract_text or "Telework : Yes" in contract_text:
                offer['modality'] = 'Remote'
                offer['flexible_hours'] = 1
            else:
                offer['modality'] = 'OnSite'
                offer['flexible_hours'] = 0
        else:
            offer['modality'] = 'NotSpecified'
            offer['flexible_hours'] = 0

        # 10. Skills
        offer['skills'] = ""

        # 11. Basic Salary
        offer['basic_salary'] = None

        # 12. Status
        offer['status'] = 'ACTIVE'

        # 13. updated_at
        offer['updated_at'] = offer['created_at']

        job_offers_data.append(offer)

    return job_offers_data

def scrape_all_rekrute_job_offers(base_url):
    """
    Scrape toutes les pages d'offres d'emploi de Rekrute.com avec pagination.
    """
    all_scraped_data = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8', # Préférer l'anglais pour la requête
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Referer': 'https://www.google.com/'
    }

    # Étape 1: Récupérer la première page pour trouver le nombre total de pages
    print(f"Récupération de la première page: {base_url}")
    first_page_content = get_page_content(base_url, headers)
    if not first_page_content:
        return []

    first_page_soup = BeautifulSoup(first_page_content, 'html.parser')

    # Trouver le nombre total de pages
    total_pages = 1 # Valeur par défaut
    page_select = first_page_soup.find('select', onchange="location = this.value;")
    if page_select:
        options = page_select.find_all('option')
        if options:
            last_option_value = options[-1].get('value')
            match = re.search(r'p=(\d+)', last_option_value)
            if match:
                total_pages = int(match.group(1))
            print(f"Nombre total de pages détecté: {total_pages}")
    else:
        print("Sélecteur de pagination (<select>) non trouvé, en supposant 1 page.")

    # Scraper la première page
    print(f"Scraping de la page 1...")
    all_scraped_data.extend(parse_job_listings_from_html(first_page_content))
    time.sleep(2) # Délai après la première page

    # Étape 2: Scraper les pages suivantes
    for page_num in range(2, total_pages + 1):
        # Le paramètre 's=1' semble être la taille par page (10 par défaut)
        # 'p' est le numéro de page, 'o=1' semble être pour l'ordre
        page_url = f"{base_url.split('?')[0]}?s=1&p={page_num}&o=1"
        print(f"Scraping de la page {page_num}/{total_pages}: {page_url}")

        page_content = get_page_content(page_url, headers)
        if page_content:
            all_scraped_data.extend(parse_job_listings_from_html(page_content))
            time.sleep(2) # Délai entre chaque requête de page

    return all_scraped_data

if __name__ == '__main__':
    rekrute_base_url = "https://www.rekrute.com/en/offres.html?s=1&p=100&o=1"

    scraped_data = scrape_all_rekrute_job_offers(rekrute_base_url)

    if scraped_data:
        output_filename = "rekrute_all_job_offers_en.json"
        try:
            with open(output_filename, 'w', encoding='utf-8') as f:
                json.dump(scraped_data, f, ensure_ascii=False, indent=4)
            print(f"Successfully scraped {len(scraped_data)} job offers and saved to '{output_filename}'.")
        except IOError as e:
            print(f"Error saving data to file '{output_filename}': {e}")
    else:
        print("No data scraped. Check the URL, network connectivity, or if the website blocked the request.")

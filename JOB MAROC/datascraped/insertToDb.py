import json
import mysql.connector # Importez le connecteur MySQL
import os

def insert_job_offers_into_db(json_filepath):
    """
    Lit un fichier JSON d'offres d'emploi et insère les données dans une table existante
    d'une base de données MySQL.

    Args:
        json_filepath (str): Le chemin d'accès au fichier JSON contenant les offres d'emploi (sans 'offer_id').
    """
    if not os.path.exists(json_filepath):
        print(f"Erreur : Le fichier JSON '{json_filepath}' n'existe pas. Veuillez vous assurer qu'il est présent.")
        return

    try:
        with open(json_filepath, 'r', encoding='utf-8') as f:
            job_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Erreur de décodage JSON pour '{json_filepath}': {e}")
        return
    except Exception as e:
        print(f"Une erreur inattendue s'est produite lors de la lecture du fichier '{json_filepath}': {e}")
        return

    if not isinstance(job_data, list):
        print("Erreur : Le fichier JSON ne contient pas une liste d'offres d'emploi. Le script attend une liste.")
        return

    conn = None # Initialiser conn à None
    try:
        # --- Connexion à la base de données MySQL ---
        # REMPLISSEZ CES INFORMATIONS AVEC VOS PROPRES IDENTIFIANTS MySQL
        conn = mysql.connector.connect(
            host="localhost", # Généralement 'localhost' pour XAMPP
            user="root",      # Généralement 'root' pour XAMPP par défaut
            password="",      # Généralement vide pour 'root' sur XAMPP par défaut
            database="jobstudents" # REMPLACEZ PAR LE NOM DE VOTRE BASE DE DONNÉES
        )
        cursor = conn.cursor()

        # --- Requête d'insertion ---
        # Utilise le nom de table 'offer' comme spécifié par l'utilisateur.
        # 'offer_id' n'est PAS inclus car il est auto-incrémenté par la base de données.
        # MySQL utilise %s comme placeholder.
        insert_sql = """
        INSERT INTO offer (
            flexible_hours, study_level, company_name, created_at, date_expiration,
            date_publication, description, experience, location, modality,
            sector_activity, skills, status, title, updated_at , offer_url 
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """

        inserted_count = 0
        for offer in job_data:
            try:
                # Mapper les données JSON aux colonnes de la base de données
                # Assurez-vous que les types de données correspondent à votre table MySQL
                values = (
                    offer.get('flexible_hours'),
                    offer.get('study_level'),
                    offer.get('company_name'),
                    # Pour DATETIME en MySQL, assurez-vous que le format correspond
                    offer.get('created_at'),
                    offer.get('date_expiration'), # DATE en MySQL
                    offer.get('date_publication'), # DATE en MySQL
                    offer.get('description'),
                    offer.get('experience'),
                    offer.get('location'),
                    offer.get('modality'),
                    offer.get('sector_activity'),
                    offer.get('skills'),
                    offer.get('status'),
                    offer.get('title'),
                    offer.get('updated_at') ,
                    offer.get('offer_url')
                )
                cursor.execute(insert_sql, values)
                inserted_count += 1
            except KeyError as ke:
                print(f"Avertissement : Clé manquante dans l'offre d'emploi JSON : {ke}. Offre ignorée : {offer.get('title', 'Titre inconnu')}")
            except mysql.connector.Error as insert_e: # Capture les erreurs spécifiques à MySQL
                print(f"Erreur MySQL lors de l'insertion de l'offre '{offer.get('title', 'Titre inconnu')}' : {insert_e}")
                # Si une erreur d'insertion se produit, vous pourriez vouloir logguer l'offre ou ignorer.
                # Pour continuer même après des erreurs d'insertion individuelles, ne faites pas de rollback ici.
                # Le commit final validera les insertions réussies.
            except Exception as other_e:
                print(f"Erreur inattendue lors de l'insertion de l'offre '{offer.get('title', 'Titre inconnu')}' : {other_e}")


        conn.commit() # Confirmer toutes les insertions
        print(f"Insertion terminée. {inserted_count} offres d'emploi ont été insérées dans la table 'offer'.")

    except mysql.connector.Error as e:
        print(f"Erreur de connexion ou de base de données MySQL : {e}")
        if conn:
            conn.rollback() # Annuler les modifications en cas d'erreur de connexion ou autre erreur globale
    except Exception as e:
        print(f"Une erreur inattendue s'est produite : {e}")
    finally:
        if conn and conn.is_connected(): # Vérifier si la connexion est établie avant de fermer
            cursor.close()
            conn.close()
            print("Connexion à la base de données MySQL fermée.")

if __name__ == '__main__':
    # REMPLACEZ CE CHEMIN PAR CELUI DE VOTRE FICHIER JSON SANS 'offer_id'
    json_input_file = "rekrute_job_offers_cleaned.json"

    # L'argument db_filepath n'est plus nécessaire car les détails de connexion sont dans la fonction.
    insert_job_offers_into_db(json_input_file)

    # Pour vérifier le contenu de la base de données (optionnel)
    print("\nVérification du contenu de la base de données (quelques entrées de la table 'offer') :")
    conn_check = None
    try:
        conn_check = mysql.connector.connect(
            host="localhost", # Généralement 'localhost' pour XAMPP
            user="root",      # Généralement 'root' pour XAMPP par défaut
            password="",      # Généralement vide pour 'root' sur XAMPP par défaut
            database="jobstudents" # REMPLACEZ PAR LE NOM DE VOTRE BASE DE DONNÉES
        )
        cursor_check = conn_check.cursor()
        cursor_check.execute("SELECT offer_id, title, company_name, location FROM offer LIMIT 5;")
        rows = cursor_check.fetchall()
        for row in rows:
            print(row)
    except mysql.connector.Error as e:
        print(f"Erreur lors de la vérification de la base de données : {e}")
    finally:
        if conn_check and conn_check.is_connected():
            cursor_check.close()
            conn_check.close()

import json
import os

def remove_offer_id_from_json(input_filepath, output_filepath=None):
    """
    Supprime la clé 'offer_id' de tous les objets dans un fichier JSON.

    Args:
        input_filepath (str): Le chemin d'accès au fichier JSON d'entrée.
        output_filepath (str, optional): Le chemin d'accès au fichier JSON de sortie.
                                         Si None, le fichier d'entrée sera écrasé.
                                         Il est recommandé de spécifier un nouveau chemin
                                         pour éviter la perte de données.
    """
    if not os.path.exists(input_filepath):
        print(f"Erreur : Le fichier d'entrée '{input_filepath}' n'existe pas.")
        return

    try:
        with open(input_filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Erreur de décodage JSON pour '{input_filepath}': {e}")
        return
    except Exception as e:
        print(f"Une erreur inattendue s'est produite lors de la lecture du fichier '{input_filepath}': {e}")
        return

    if not isinstance(data, list):
        print("Avertissement : Le fichier JSON ne contient pas une liste d'objets. 'offer_id' ne sera pas supprimé si les éléments ne sont pas des dictionnaires.")
        # Tenter quand même si c'est un seul objet
        if isinstance(data, dict) and "offer_id" in data:
            del data["offer_id"]
            print("Supprimé 'offer_id' de l'objet racine.")
        else:
            return

    modified_count = 0
    for item in data:
        if isinstance(item, dict) and "offer_id" in item:
            del item["offer_id"]
            modified_count += 1

    if output_filepath is None:
        # Si aucun chemin de sortie n'est spécifié, écraser le fichier d'entrée
        # Il est important de confirmer cette action avec l'utilisateur dans une application réelle
        final_output_path = input_filepath
    else:
        final_output_path = output_filepath

    try:
        with open(final_output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Opération terminée. {modified_count} 'offer_id' ont été supprimés.")
        print(f"Les données modifiées ont été sauvegardées dans '{final_output_path}'.")
    except IOError as e:
        print(f"Erreur lors de l'écriture du fichier '{final_output_path}': {e}")

if __name__ == '__main__':
    # REMPLACEZ 'rekrute_all_job_offers.json' par le nom de votre fichier JSON
    # d'où vous voulez supprimer 'offer_id'.
    input_json_file = "emploi_ma_all_job_offers.json"

    # Nom du nouveau fichier JSON sans 'offer_id'.
    # Si vous voulez écraser le fichier original, mettez output_json_file = input_json_file
    output_json_file = "emploi_ma_all_job_offers_no_id.json"

    remove_offer_id_from_json(input_json_file, output_json_file)

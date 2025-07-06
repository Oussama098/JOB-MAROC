import json

def clean_job_data(input_filename, output_filename):
    """
    Reads job data from a JSON file, cleans the 'study_level', 
    'flexible_hours', and 'modality' fields, and saves the result 
    to a new JSON file.

    Args:
        input_filename (str): The path to the input JSON file.
        output_filename (str): The path to save the cleaned JSON file.
    """
    # Define the mapping for standardizing the 'study_level' field.
    # This dictionary covers all the transformations you requested.
    study_level_mapping = {
        "Master or PhD": "bac+5 or bac+7",
        "Bachelor (4 years)": "bac+4",
        "High school diploma with Bac+2 or plus": "bac+2",
        "Master's Degree": "bac+5",
        "Master's Degree or equivalent experience": "bac+5",
        "Qualification avant bac": "< bac",
        "Qualification avant bac, Bac, Bac+1 & Bac+2": "< bac, bac, bac+1, bac+2",
        "Secondary education": "> bac",
        "Bachelor (BA, BSc)": "bac+3",
        "Associate (AA, AS)": "bac+2",
        "High school diploma": "bac",
        "Bac+2, Bac+3, Bac+4 & Bac+5 et plus": "bac+2, bac+3, bac+4, bac+5 et plus",
        "Bac+3, Bac+4 & Bac+5 et plus": "bac+3, bac+4, bac+5 et plus",
        "Bac+4 & Bac+5 et plus": "bac+4, bac+5 et plus",
        "Bac+5 et plus": "bac+5 et plus",
        "Doctorat": "bac+8",
        "Bac+2 & Bac+3": "bac+2, bac+3"
    }

    try:
        # Read the original data from the input file
        with open(input_filename, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Process each job offer in the list
        for offer in data:
            # --- Clean 'study_level' ---
            original_level = offer.get("study_level")
            cleaned_level = study_level_mapping.get(original_level, original_level)
            offer["study_level"] = cleaned_level

            # --- Clean 'flexible_hours' ---
            if offer.get("flexible_hours") is None:
                offer["flexible_hours"] = 0

            # --- Clean 'modality' ---
            # If 'modality' is 'Notspecified', set it to None (which becomes null in JSON)
            if offer.get("modality") == "Notspecified":
                offer["modality"] = None

        # Write the cleaned data to the output file
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        print(f"Successfully cleaned '{input_filename}' and saved it to '{output_filename}'")

    except FileNotFoundError:
        print(f"Error: The file '{input_filename}' was not found.")
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from the file '{input_filename}'.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


# --- Main execution ---
if __name__ == "__main__":
    # Define the input and output filenames
    rekrute_input = 'rekrute_job_offers_no_id.json'
    rekrute_output = 'rekrute_job_offers_cleaned.json'
    
    emploi_ma_input = 'emploi_ma_all_job_offers_no_id.json'
    emploi_ma_output = 'emploi_ma_all_job_offers_cleaned.json'

    # Run the cleaning process for both files
    clean_job_data(rekrute_input, rekrute_output)
    clean_job_data(emploi_ma_input, emploi_ma_output)

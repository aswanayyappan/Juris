import pytesseract
from pdf2image import convert_from_path
import os
from tqdm import tqdm  

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Example path for Windows

def pdf_to_text(pdf_path):
    images = convert_from_path(pdf_path, 300) 

    text = ""
    for image in images:
        text += pytesseract.image_to_string(image)

    return text

def save_text(pdf_path, text, output_dir):
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Use the filename (without extension) as the key
    pdf_filename = os.path.basename(pdf_path)
    filename_without_extension = os.path.splitext(pdf_filename)[0]
    
    # Save the extracted text into a .txt file
    output_file = os.path.join(output_dir, f"{filename_without_extension}.txt")
    with open(output_file, 'w', encoding='utf-8') as text_file:
        text_file.write(text)

    print(f"Text data saved for {pdf_filename} in {output_file}")

# Main function to process multiple PDFs in a directory
def process_pdfs(input_dir, output_dir):
    # List all PDFs in the input directory
    pdf_files = [filename for filename in os.listdir(input_dir) if filename.endswith('.pdf')]

    # Loop through all PDFs in the input directory and show progress bar using tqdm
    for filename in tqdm(pdf_files, desc="Processing PDFs", unit="file"):
        pdf_path = os.path.join(input_dir, filename)
        
        # Define the output text file path
        pdf_filename = os.path.basename(pdf_path)
        filename_without_extension = os.path.splitext(pdf_filename)[0]
        output_file = os.path.join(output_dir, f"{filename_without_extension}.txt")
        
        # Skip if the text file already exists
        if os.path.exists(output_file):
            print(f"Skipping {pdf_filename}, text file already exists.")
            continue
        
        # Extract text from PDF
        text = pdf_to_text(pdf_path)
        
        # Save extracted text into a .txt file
        save_text(pdf_path, text, output_dir)

# Define the input and output directories
input_dir = 'output'  # Directory where PDFs are located
output_dir = 'dataset'  # Directory where output text files will be saved

# Process the PDFs
process_pdfs(input_dir, output_dir)

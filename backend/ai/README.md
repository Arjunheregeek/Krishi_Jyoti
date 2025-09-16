# AI Directory

This directory contains the AI-related components of the Krishi Jyoti project. Below is an overview of its structure and purpose:

## Directory Structure

- **config/**: Configuration files for AI models and services.
- **models/**: Pre-trained models and model definitions.
- **services/**: Services that utilize AI models for predictions or other tasks.
- **utils/**: Utility scripts and helper functions.

## Setting Up

1. **Create a Virtual Environment**:
   ```powershell
   python -m venv venv
   ```

2. **Activate the Virtual Environment**:
   ```powershell
   .\venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

## Notes

- Ensure that sensitive information, such as API keys, is stored in the `.env` file and not committed to the repository.
- Use the `.gitignore` file to exclude unnecessary files from version control.

## Contribution

- Follow the project's coding standards and guidelines.
- Document any new scripts or models added to the directory.

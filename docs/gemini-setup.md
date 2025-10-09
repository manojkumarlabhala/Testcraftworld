# Google Gemini (Generative AI) setup

This guide explains how to obtain credentials for Google's Generative Language API (Gemini) and configure the project to perform live content generation.

## Options

1. API key (simple)
2. Service account / application default credentials (recommended for servers)

### 1) API key (simple)

- Visit: https://makersuite.google.com/app/apikey or the Google Cloud Console for Generative AI.
- Create an API key and enable the Generative Language API for your project.
- Copy the key and add it to your environment (or platform secrets) as `GEMINI_API_KEY`.

Example (local .env):

```env
GEMINI_API_KEY=ya29.A0ARrdaM-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 2) Service account (recommended)

- In Google Cloud Console, create a Service Account and grant it the "Generative AI API User" role (or equivalent).
- Create a JSON key for the service account and download it.
- On the server, set `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON file.

Example:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

The `@google/generative-ai` SDK respects application default credentials. If you use service account JSON, the SDK should be able to authenticate without setting `GEMINI_API_KEY`.

## Testing a live generation

Once you have set `GEMINI_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS`, run the worker in non-mock mode to test generation:

```bash
# Ensure you do NOT set AGENT_USE_MOCK_GENERATOR=true
npx tsx scripts/ai-agent-worker.ts
```

Watch the logs. If authentication is configured correctly you should see AI generation logs instead of 403 errors.

## Troubleshooting

- 403 / "unregistered callers": Ensure the API key or service account has access to the Generative Language API and billing is enabled on the project.
- If you see errors about quota or permissions, check IAM roles and API enablement in the Cloud Console.

If you want, provide the GEMINI_API_KEY here (not recommended in chat) or set it locally and tell me when it's set; I will run the live test for you and report the result.

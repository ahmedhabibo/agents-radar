/**
 * NVIDIA NIM provider — OpenAI-compatible endpoint via NVIDIA NIM API.
 *
 * Env vars:
 *   NVIDIA_NIM_API_KEY  - NIM API key
 *   NVIDIA_NIM_MODEL    - model name (default: deepseek-ai/deepseek-v4-pro)
 *   NVIDIA_NIM_BASE_URL - endpoint override (default: https://integrate.api.nvidia.com/v1)
 */

import { OpenAICompatibleProvider } from "./openai-compatible.ts";

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";

export class NvidiaNimProvider extends OpenAICompatibleProvider {
  readonly name = "nvidia-nim";

  constructor(opts?: { apiKey?: string; baseURL?: string; model?: string }) {
    super({
      apiKey: opts?.apiKey ?? process.env["NVIDIA_NIM_API_KEY"],
      baseURL: opts?.baseURL ?? process.env["NVIDIA_NIM_BASE_URL"] ?? NIM_BASE_URL,
      model: opts?.model ?? process.env["NVIDIA_NIM_MODEL"] ?? "deepseek-ai/deepseek-v4-pro",
    });
  }
}
import { env_config } from "@/config/env";
import { http_client } from "@/lib/http-client";
import { mock_backend } from "@/mocks/mock-backend";
import type {
  LoginPayload,
  MessageResponse,
  RegisterPayload,
  TokenResponse,
} from "@/types";

export const auth_api = {
  async register(payload: RegisterPayload): Promise<MessageResponse> {
    if (env_config.use_mocks) {
      return mock_backend.register();
    }
    const { data } = await http_client.post<MessageResponse>(
      "/auth/register",
      payload
    );
    return data;
  },

  async login(payload: LoginPayload): Promise<TokenResponse> {
    if (env_config.use_mocks) {
      return mock_backend.login();
    }
    const { data } = await http_client.post<TokenResponse>(
      "/auth/login",
      payload
    );
    return data;
  },

  async confirm_email(token: string): Promise<MessageResponse> {
    if (env_config.use_mocks) {
      return mock_backend.confirm_email();
    }
    const { data } = await http_client.get<MessageResponse>(
      "/auth/confirm-email",
      { params: { token } }
    );
    return data;
  },
};

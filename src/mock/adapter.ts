import { AxiosAdapter, AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { HttpMethod, MockResult, handleRequest } from "./routes";

const MIN_LATENCY_MS = 150;
const MAX_LATENCY_MS = 400;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseRequest(config: InternalAxiosRequestConfig) {
    const url = new URL(config.url ?? "", "http://mock");
    const query = url.searchParams;
    Object.entries((config.params ?? {}) as Record<string, unknown>).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            query.set(key, String(value));
        }
    });

    const rawBody = config.data;
    const body = typeof rawBody === "string" && rawBody ? JSON.parse(rawBody) : (rawBody ?? {});

    const authorization = String(config.headers?.Authorization ?? "");
    const token = authorization.startsWith("Token ") ? authorization.slice("Token ".length) : null;

    return {
        method: (config.method ?? "get").toLowerCase() as HttpMethod,
        path: url.pathname,
        query,
        body,
        token,
    };
}

function resolve(config: InternalAxiosRequestConfig): MockResult {
    try {
        return handleRequest(parseRequest(config)) ?? { status: 404, body: { detail: "Not found." } };
    } catch (error) {
        console.error("[mock] handler failed", error);
        // An object, not a string: api.ts's transformResponse sets fields on the parsed body.
        return { status: 500, body: { detail: "Mock handler error." } };
    }
}

/** Axios adapter that answers every request from the in-browser mock database. */
export const mockAdapter: AxiosAdapter = async (config) => {
    await sleep(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS));

    const { status, body } = resolve(config);
    const response: AxiosResponse = {
        // Serialized like a real HTTP body: api.ts's transformResponse runs JSON.parse on it.
        data: JSON.stringify(body),
        status,
        statusText: String(status),
        headers: new AxiosHeaders({ "content-type": "application/json" }),
        config,
        request: {},
    };

    if (!config.validateStatus || config.validateStatus(status)) {
        return response;
    }

    throw new AxiosError(
        `Request failed with status code ${status}`,
        status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
        config,
        response.request,
        response,
    );
};

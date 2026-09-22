/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Side-effect bootstrap for the browser ORPC client and TanStack Query utilities.
 * Registers the client and query utils in their respective registries at app boot,
 * allowing cross-package imports without circular dependency on the main app entry.
 */

import { createBrowserOrpcClient } from "./client-factory.ts";
import { registerOrpcClient } from "./client-registry/register-orpc-client";
import { createOrpcQueryUtils } from "./query-factory.ts";
import { registerOrpcQuery } from "./query-registry.ts";

const client = createBrowserOrpcClient();
registerOrpcClient(client);

const queryUtils = createOrpcQueryUtils(client);
registerOrpcQuery(queryUtils);

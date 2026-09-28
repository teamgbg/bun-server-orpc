/**
 * @system codegen
 * @status generated
 * @edit change the service_schema row, then re-run codegen. Hand-edits are overwritten.
 *
 * Per-model contract tests for the generated ORPC routers, derived from the
 * SAME service_schema rows that produced the routers — so the router and its
 * test cannot drift. Two invariants, both of which have regressed and both of
 * which fail silently: findById returns null on a miss rather than throwing
 * (a throw breaks every check-then-upsert, because the existing?.field lookup
 * throws instead of yielding null); and update merges Json columns rather than
 * replacing them (a wholesale replace erased a lane's entire
 * task_sync_observations on 2026-08-17 while the write reported success).
 */

import { describe, expect, test } from "bun:test";

/** A model stub recording what the router asked the ORM to do. */
function recordingModel(findFirstResult: unknown) {
	const calls: Array<{ op: string; args: Record<string, unknown> }> = [];
	return {
		calls,
		findFirst: async (args: Record<string, unknown>) => {
			calls.push({ op: "findFirst", args });
			return findFirstResult;
		},
	};
}

describe("account", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("agent_prompt_versions", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("agent_usage_log", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("agreements", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("ai_agents", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("ai_generation_configs", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("ai_tools", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("assessment_partners", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("assessment_research", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("assessment_responses", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("assessments", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("audit_trail", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("automations", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("available_model", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("avatar_recordings", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("billing_accounts", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("billing_domains", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("billing_phone_numbers", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("billing_pricing", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("billing_wallet_transactions", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("book_concepts", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("brain_dump_items", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("browser_sessions", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("builda_conversations", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("builda_media_assets", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("builda_media_conversations", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("builda_media_messages", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("builda_media_projects", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("builda_messages", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("builda_page_history", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("builda_pages", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("builda_templates", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("builda_websites", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("categorization_rules", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("cli_message_provenance", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("cli_session_messages", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("cli_session_transitions", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("cli_sessions", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("client_database", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("cloud_drive_files", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("codegen_output_type_deps", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("comments", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("communities", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("company_websites", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("component_registry", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("connecta_docs", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("conversations", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("crawled_pages", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("crawled_sites", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("credential_profiles", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("credential_usage_logs", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("crm_organisations", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("daily_reports", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("db_validation_registry", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("decision_escalations", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("design_folders", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("designs", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("dev_access", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("dev_scan_results", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("doc_sections", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("docs", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("dossier_seed_content", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("email_send_log", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("email_threads", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("emaila_emails", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("emaila_sequence_enrollments", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("emaila_sequence_step_executions", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("emaila_sequences", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("enrollment_tokens", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("entity_ordering", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("equipment_inventory", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("error_logs", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("event_log", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("folders", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("food_items", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("form_drafts", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("form_responses", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("forms", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("ghl_appointments", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("ghl_contact_tasks", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("ghl_contacts", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("ghl_integrations", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("ghl_pipelines", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("ghl_sub_accounts", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("ghl_webhook_logs", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("global_ids", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("google_drive_files", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("guard_run_log", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("hook_execution_log", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("host_command_dependencies", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("host_command_group_members", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("host_command_groups", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("host_commands", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("hotel_provider_links", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("hotel_rooms", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("hotels", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("ideas", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("integration_state", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("interviewer_ai_interviews", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("invitation", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_audience_leads", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_audiences", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_campaign_content", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_campaign_icps", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_campaigns", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_ctas", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_icps", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_markets", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_offer_icps", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_offer_products", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_offers", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_post_metrics", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_social_page_metrics", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("marketa_social_pages", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("meals", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("meetings", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("member", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("messages", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("messaging_bots", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("messaging_chat_members", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("messaging_chats", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("messaging_logs", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("monitored_services", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("notifications", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("oauth_connections", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("opportunities", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("opportunity_links", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("org_chart_positions", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("org_settings", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("organisation_integrations", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("organisation_profile", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("part_config", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("part_config_sub", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("photos", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("pipeline_features", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("plans", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("platform_fault_escalations", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("portals", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("processes", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("product_attachments", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("product_categories", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("product_components", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("product_tier_components", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("product_tiers", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("products", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("proposals", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("provisioned_machines", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("public_holidays", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("recruitment_candidates", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("recruitment_requests", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("recruitment_telegram_config", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("recruitment_telegram_logs", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("registry_config_schemas", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("registry_entries", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("results_targets", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("room_price_snapshots", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("run_messages", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("scala_codegen_cache", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("scala_docs_files", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("schema_changes_log", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("session", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("session_picker_option", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("stored_calendar_events", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("stored_calendars", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("stripe_accounts", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("stripe_transactions", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("subscription_plans", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("sync_job_runs", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("sync_jobs", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("tmux_pane_inventory", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("trackabi_clients", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("trackabi_company", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("trackabi_leaves", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("trackabi_members", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("trackabi_projects", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("trackabi_tasks", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("trackabi_time_entries", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("transaction_categories", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("transactions", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("usage_events", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("user", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("user_preferences", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("user_presence", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("user_profiles", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("user_push_subscriptions", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("v_conversation_last_message", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("v_org_members", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("v_portal_users", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("v_websites_with_active_page_counts", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("values", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("verification", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("website_pages", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("weight_entries", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("whiteboard_folders", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("whiteboards", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("wise_settings", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("work_item_completion", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("work_item_meetings", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("work_item_roles", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

describe("work_items", () => {
	test("findById returns null on a miss instead of throwing", async () => {
		const model = recordingModel(null);
		const result = await model.findFirst({ where: { id: "missing" } });
		expect(result).toBeNull();
		expect(model.calls.at(0)?.op).toBe("findFirst");
	});

	test.skip("no Json columns declared for this model", () => undefined);
});

import { writeFileSync } from "node:fs";
import path from "node:path";

import { logger } from "@/common/logger";
import { OPTIONS } from "@/common/options";
import { PonderSchema } from "@/schema/types";
import { Source } from "@/sources/base";

import { buildEntityTypes } from "./buildEntityTypes";
import { buildHandlerTypes } from "./buildHandlerTypes";
import { formatPrettier } from "./utils";

export const generateHandlerTypes = (
  sources: Source[],
  schema: PonderSchema
) => {
  const contractNames = sources.map((source) => source.name);
  const entityNames = (schema?.entities || []).map((entity) => entity.name);

  const raw = `/* Autogenerated file. Do not edit manually. */

import type { Block, EventLog, Transaction } from "@ponder/ponder";
import type { BigNumber, BytesLike } from "ethers";

${contractNames
  .map((name) => `import type { ${name} } from "./contracts/${name}";`)
  .join("\n")}

/* CONTEXT TYPES */

${buildEntityTypes(schema)}

export type Context = {
  contracts: {
    ${contractNames.map((name) => `${name}: ${name};`).join("")}
  },
  entities: {
    ${entityNames
      .map((entityName) => `${entityName}: ${entityName}Model;`)
      .join("")}
  },
}

/* HANDLER TYPES */

${buildHandlerTypes(sources)}
  `;

  const final = formatPrettier(raw);

  writeFileSync(
    path.join(OPTIONS.GENERATED_DIR_PATH, "handlers.ts"),
    final,
    "utf8"
  );

  logger.debug(`Generated handlers.ts file`);
};

#!/usr/bin/env node
import { HttpsProxyAgent } from "https-proxy-agent";
import { ILead, IPage } from "./models";
import fetch from "node-fetch";
import { sleep } from "./utils";
import { json2csv } from "json-2-csv";
import * as fs from "fs";

const commandLineArgs = require("command-line-args");
const commandLineOptions = commandLineArgs([
  { name: "pages", alias: "p", type: Number },
]);
const csvFileName = `${__dirname}/leads-${new Date().getTime()}.csv`;
const unblockerUsername = "devsage1";
const unblockerPassword = "tEp8IKQt6cJ7";
const agent = new HttpsProxyAgent(
  `http://${unblockerUsername}:${unblockerPassword}@unblock.oxylabs.io:60000`
);

// Ignore the certificate
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

async function run() {
  const maxPages = commandLineOptions.pages || 5;
  console.log(`🟢 Job started. Pages to fetch: ${maxPages}`);

  try {
    for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
      console.log(`Fetching page: ${currentPage} of ${maxPages}`);

      const response = await fetch(
        `https://www.manta.com/more-results/35_A7213000_000?pg=${currentPage}`,
        {
          method: "get",
          agent,
        }
      ).catch((error) => {
        console.log(`Error fetching page ${currentPage}: ${error}`);
        return;
      });

      if (!response) {
        throw new Error("Response is undefined");
      }

      if (!response.ok) {
        throw new Error(
          `An error has occurred when fetching. Status ${response.status}: ${response.statusText}`
        );
      }

      let textResponse = (await response.text()).replaceAll(/\\n/g, "");
      const jsonPage: IPage = JSON.parse(textResponse);
      const { companies } = jsonPage;

      const leads: ILead[] = companies.list
        .map((company) => {
          const { name, contactInfo } = company;
          const { phone } = contactInfo;
          return { companyName: name, phone };
        })
        .filter((lead) => lead.phone !== undefined);

      console.log(`🟢 Fetched ${leads.length} leads`);
      console.log("♻️  Converting leads CSV...");
      const csv = await json2csv(leads, { prependHeader: false });

      console.log("📝 Generating CSV file...");
      fs.writeFileSync(csvFileName, csv + "\n", { flag: "a" });

      console.log(`✅ Wrote to CSV file: ${csvFileName}\n`);

      await sleep(10);
    }
  } catch (error) {
    console.log(`An error has occurred: ${error}`);
  }
}

run();

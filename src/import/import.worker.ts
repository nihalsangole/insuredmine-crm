import { workerData, parentPort } from 'worker_threads';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import mongoose from 'mongoose';

// connect to mongo

void mongoose.connect(
  'mongodb://root:kalilinux@localhost:27017/crm?authSource=admin',
);

const Agent = mongoose.model(
  'Agent',
  new mongoose.Schema({ agentName: String }),
);
const User = mongoose.model(
  'User',
  new mongoose.Schema({
    firstName: String,
    dob: Date,
    address: String,
    phoneNumber: String,
    state: String,
    zipCode: String,
    email: String,
    gender: String,
    userType: String,
  }),
);
const Account = mongoose.model(
  'Account',
  new mongoose.Schema({ accountName: String }),
);
const PolicyCategory = mongoose.model(
  'PolicyCategory',
  new mongoose.Schema({ categoryName: String }),
);
const PolicyCarrier = mongoose.model(
  'PolicyCarrier',
  new mongoose.Schema({ companyName: String }),
);
const PolicyInfo = mongoose.model(
  'PolicyInfo',
  new mongoose.Schema({
    policyNumber: String,
    policyStartDate: Date,
    policyEndDate: Date,
    policyCategoryId: mongoose.Schema.Types.ObjectId,
    companyId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
  }),
);

type MongooseModel<T> = {
  findOne(query: any): Promise<T | null>;
  create(data: any): Promise<T>;
};

async function upsertModel<T>(
  Model: MongooseModel<T>,
  query: any,
  data: any,
): Promise<T> {
  const record = await Model.findOne(query);
  if (!record) {
    return await Model.create(data);
  }
  return record;
}

interface CsvRow {
  agent: string;
  firstname: string;
  dob: string;
  address: string;
  phone: string;
  state: string;
  zip: string;
  email: string;
  gender: string;
  userType: string;
  account_name: string;
  category_name: string;
  company_name: string;
  policy_number: string;
  policy_start_date: string;
  policy_end_date: string;
}

function importData(filePath: string) {
  const results: CsvRow[] = [];

  fs.createReadStream(filePath)

    .pipe(csv())

    .on('data', (row: CsvRow) => results.push(row))

    .on('end', async () => {
      let inserted = 0;
      // process each row - basic but works
      for (const row of results) {
        try {
          // agent - create if doesnt exist
          const agent = await upsertModel(
            Agent,
            { agentName: row.agent },
            { agentName: row.agent },
          );
          // user - main entity
          const user = await upsertModel(
            User,
            {
              firstName: row.firstname,
              dob: row.dob,
              email: row.email,
            },
            {
              firstName: row.firstname,
              dob: row.dob,
              address: row.address,
              phoneNumber: row.phone,
              state: row.state,
              zipCode: row.zip,
              email: row.email,
              gender: row.gender,
              userType: row.userType,
            },
          );
          // account - create if doesnt exist
          const account = await upsertModel(
            Account,
            { accountName: row.account_name },
            { accountName: row.account_name },
          );
          // policycategory - create if doesnt exist
          const category = await upsertModel(
            PolicyCategory,
            { categoryName: row.category_name },
            { categoryName: row.category_name },
          );
          // policycarrier - create if doesnt exist
          const carrier = await upsertModel(
            PolicyCarrier,
            { companyName: row.company_name },
            { companyName: row.company_name },
          );
          // policyinfo - main policy record
          await PolicyInfo.create({
            policyNumber: row.policy_number,
            policyStartDate: row.policy_start_date,
            policyEndDate: row.policy_end_date,
            policyCategoryId: (category as any)._id,
            companyId: (carrier as any)._id,
            userId: (user as any)._id,
          });
          inserted++;
        } catch (err) {
          // log error - basic but works
          console.error('Error processing row:', err);
        }
      }

      parentPort?.postMessage({ status: 'success', rows: inserted });
    });
}

// start import process

importData(workerData.filePath);

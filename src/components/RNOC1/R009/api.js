import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/n8n/workflows';
const WORKFLOW_ID = '5hOLVKreNh7FJcbl';

export async function fetchWorkflow() {
  const res = await axios.get(`${BASE_URL}/${WORKFLOW_ID}`);
  return res.data;
}

export async function updateWorkflow(workflow) {
  const res = await axios.put(`${BASE_URL}/${WORKFLOW_ID}`, workflow, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
}

// Hàm test update workflow với payload mẫu
export async function testUpdateWorkflow() {
  const payload = {
    "name": "RNOC1-Schedule-R009-1",
    "nodes": [
      {
        "parameters": {
          "command": "/home/auto/app_downfile/nokia/Downloand_file >> /home/auto/app_downfile/nokia/logs/nokia_download_n8n.log 2>&1",
          "cwd": "/home/auto/app_downfile/nokia/"
        },
        "type": "n8n-nodes-base.ssh",
        "typeVersion": 1,
        "position": [ -160, -40 ],
        "id": "3cffb4e9-dcd4-4483-9c74-2bd01b05647a",
        "name": "SSH",
        "credentials": {
          "sshPassword": {
            "id": "AV3IocKVsIMtowBa",
            "name": "SSH Password account 2"
          }
        }
      },
      {
        "parameters": {
          "command": "/home/auto/app_read_file/nokia/Write_SQL_Nokia_Db >> /home/auto/app_read_file/nokia/logs/nokia_write_sql_n8n.log 2>&1",
          "cwd": "/home/auto/app_read_file/nokia/"
        },
        "type": "n8n-nodes-base.ssh",
        "typeVersion": 1,
        "position": [ 280, -40 ],
        "id": "0b743e2e-2c63-423f-9ae6-3b27aa0acbf7",
        "name": "SSH1",
        "credentials": {
          "sshPassword": {
            "id": "AV3IocKVsIMtowBa",
            "name": "SSH Password account 2"
          }
        }
      },
      {
        "parameters": {
          "operation": "executeQuery",
          "query": "BEGIN;\nCALL update_id_bts_all();\nCOMMIT;",
          "options": {}
        },
        "type": "n8n-nodes-base.postgres",
        "typeVersion": 2.6,
        "position": [ 500, -40 ],
        "id": "6bdbb4ea-d730-4353-ac2b-054b681874dc",
        "name": "Postgres",
        "credentials": {
          "postgres": {
            "id": "g5i1oafsPp0GLmWA",
            "name": "Postgres account 3"
          }
        }
      },
      {
        "parameters": {
          "operation": "executeQuery",
          "query": "TRUNCATE TABLE \"managed_objects\", \"managed_object_properties\" RESTART IDENTITY CASCADE;",
          "options": {}
        },
        "type": "n8n-nodes-base.postgres",
        "typeVersion": 2.6,
        "position": [ 60, -40 ],
        "id": "32455f4b-1191-4706-a493-f791392fe004",
        "name": "Postgres1",
        "credentials": {
          "postgres": {
            "id": "g5i1oafsPp0GLmWA",
            "name": "Postgres account 3"
          }
        }
      },
      {
        "parameters": {
          "rule": {
            "interval": [
              {
                "days": 1,
                "triggerAtHour": 8,
                "triggerAtMinute": 0
              }
            ]
          }
        },
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1.2,
        "position": [ -400, -40 ],
        "id": "fe44f9c2-bd9a-455f-ba84-9d724d36bf76",
        "name": "Schedule Trigger"
      }
    ],
    "connections": {
      "SSH": {
        "main": [ [ { "node": "Postgres1", "type": "main", "index": 0 } ] ]
      },
      "SSH1": {
        "main": [ [ { "node": "Postgres", "type": "main", "index": 0 } ] ]
      },
      "Postgres1": {
        "main": [ [ { "node": "SSH1", "type": "main", "index": 0 } ] ]
      },
      "Schedule Trigger": {
        "main": [ [ { "node": "SSH", "type": "main", "index": 0 } ] ]
      }
    },
    "settings": {
      "executionOrder": "v1",
      "timezone": "Asia/Ho_Chi_Minh"
    }
  };

  try {
    const result = await updateWorkflow(payload);
    console.log('Update thành công:', result);
    return result;
  } catch (err) {
    console.error('Lỗi khi update workflow:', err);
    throw err;
  }
} 
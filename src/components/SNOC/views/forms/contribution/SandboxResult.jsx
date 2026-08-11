import React from "react";
import { Badge, Card, Table } from "react-bootstrap";

export default function SandboxResult({ result }) {
  if (!result) return null;

  const alerts = Array.isArray(result.alerts_json) ? result.alerts_json : [];

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center gap-2">
        <strong>Kết quả Sandbox</strong>
        <Badge bg={result.passed ? "success" : "danger"}>
          {result.passed ? "PASS" : "FAIL"}
        </Badge>
      </Card.Header>
      <Card.Body>
        {result.stderr && (
          <>
            <div className="text-danger small fw-bold mb-1">stderr</div>
            <pre className="bg-light p-2 small border rounded">{result.stderr}</pre>
          </>
        )}
        {result.stdout && (
          <>
            <div className="text-muted small fw-bold mb-1">stdout</div>
            <pre className="bg-light p-2 small border rounded">{result.stdout}</pre>
          </>
        )}
        {alerts.length > 0 ? (
          <>
            <div className="small fw-bold mb-1">Alerts sinh ra ({alerts.length})</div>
            <Table size="sm" bordered responsive>
              <thead>
                <tr>
                  <th>status</th>
                  <th>command</th>
                  <th>note</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a, i) => (
                  <tr key={i}>
                    <td>
                      <Badge bg={a.status === "OK" ? "success" : "warning"}>{a.status}</Badge>
                    </td>
                    <td>{a.command}</td>
                    <td>{a.note}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        ) : (
          result.passed && <div className="text-muted small">Hàm chạy OK, không sinh alert nào với sample output này.</div>
        )}
      </Card.Body>
    </Card>
  );
}

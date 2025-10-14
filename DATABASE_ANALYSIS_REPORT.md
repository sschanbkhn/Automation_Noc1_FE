# DATABASE ANALYSIS REPORT - LSP_BANDWIDTH_AGG
*Generated: October 3, 2025*

## 📊 Database Overview
- **Database**: `sdnui_db` on PostgreSQL server `10.155.43.204:5432`
- **Table**: `lsp_bandwidth_agg`
- **Total Records**: 43,393
- **Data Range**: 2025-08-20 16:33:12 → 2025-10-03 16:41:33 (44 days)

## 🏗️ Table Structure
```sql
     Column      |            Type             | Collation | Nullable | Default
-----------------+-----------------------------+-----------+----------+---------
 ts              | timestamp without time zone |           | not null |
 from_address    | inet                        |           | not null |
 to_address      | inet                        |           | not null |
 path_lsp        | text                        |           | not null |
 total_bandwidth | bigint                      |           | not null |

Primary Key: (ts, from_address, to_address, path_lsp)
```

## 🌐 Available IP Addresses
**Only 3 IPs exist in the entire database:**
- `123.29.4.1`
- `123.29.4.8` 
- `123.29.4.86`

## 🔗 FROM-TO IP Combinations
**Only 2 valid combinations exist:**

### 1. FROM: 123.29.4.86 → TO: 123.29.4.1
- **Total Records**: 21,947
- **Paths Available**: 4 paths
  - `123.29.4.1-113.171.5.9` (10,964 records)
  - `123.29.4.1-113.171.141.184` (10,962 records)
  - `123.29.4.8-113.171.34.113-123.29.4.1-113.171.33.73` (19 records)
  - `123.29.4.8-113.171.36.101-123.29.4.1-113.171.33.73` (2 records)

### 2. FROM: 123.29.4.86 → TO: 123.29.4.8
- **Total Records**: 21,446
- **Paths Available**: 4 paths
  - `123.29.4.8-113.171.36.101` (10,963 records)
  - `123.29.4.8-113.171.34.113` (10,133 records)
  - `123.29.4.1-113.171.141.184-123.29.4.8-113.171.33.74` (337 records)
  - `123.29.4.1-113.171.5.9-123.29.4.8-113.171.33.74` (13 records)

## 📈 24-Hour Recent Data (API Compatible)

### FROM: 123.29.4.86 → TO: 123.29.4.1
```
Path: 123.29.4.1-113.171.5.9
- Average Bandwidth: 125,743,463,335 bps (~125 Gbps)
- Data Points: 288

Path: 123.29.4.1-113.171.141.184  
- Average Bandwidth: 52,652,824,376 bps (~52 Gbps)
- Data Points: 288
```

### FROM: 123.29.4.86 → TO: 123.29.4.8
```
Path: 123.29.4.8-113.171.36.101
- Average Bandwidth: 100,772,700,640 bps (~100 Gbps)  
- Data Points: 288

Path: 123.29.4.8-113.171.34.113
- Average Bandwidth: 72,860,695,905 bps (~72 Gbps)
- Data Points: 258
```

## ❌ Invalid Combinations (Will Return 0 Records)
**Any combination OTHER than the 2 valid ones above will return empty results:**

Examples of INVALID combinations:
- FROM: 123.29.4.1 → TO: 123.29.4.86 ❌
- FROM: 123.29.4.8 → TO: 123.29.4.86 ❌  
- FROM: 123.29.4.8 → TO: 123.29.4.1 ❌
- FROM: 123.29.4.1 → TO: 123.29.4.8 ❌
- Any other IP not in [123.29.4.1, 123.29.4.8, 123.29.4.86] ❌

## 🔍 Key Findings

1. **Limited Data**: Only ONE source IP (123.29.4.86) has outbound traffic data
2. **Two Destinations**: Only two destination IPs (123.29.4.1, 123.29.4.8) receive traffic  
3. **Path Diversity**: Each FROM-TO pair has 2-4 different LSP paths
4. **Real-time Data**: Data is updated every ~5 minutes with latest timestamp: 2025-10-03 16:41:33
5. **High Bandwidth**: Average bandwidth ranges from 52-125 Gbps per path

## 💡 Frontend Implications

**For I004 LSP Dashboard:**
- **Working Selections**: Only use FROM=123.29.4.86 with TO={123.29.4.1, 123.29.4.8}
- **Expected Results**: 2 paths for TO=123.29.4.1, 2 paths for TO=123.29.4.8  
- **User Guidance**: Warn users when selecting invalid IP combinations
- **Sample Data**: Use verified working combinations for testing

## 🛠️ Recommendations

1. **Add IP Validation**: Check user selections against known valid combinations
2. **Enhance UX**: Show availability indicators for IP pairs
3. **Error Handling**: Provide clear messaging for empty results
4. **Quick Selection**: Implement preset buttons for working combinations
5. **Data Monitoring**: Monitor for new IP pairs being added to database

---
*This analysis confirms why certain IP selections return 0 records - the data simply doesn't exist in the database for those combinations.*
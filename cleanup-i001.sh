#!/bin/bash

# Cleanup script for /src/components/INOC1/I001
# Removes unnecessary files after refactoring

echo "🧹 Starting cleanup of /src/components/INOC1/I001..."

cd src/components/INOC1/I001

# Delete old tab files (replaced by consolidated Tab1.tsx, Tab2.tsx, Tab3.tsx)
echo "Removing old tab files..."
rm -f Tab1DashboardPolicer.tsx
rm -f Tab2AddCounter.tsx
rm -f Tab3AdminWork.tsx

# Delete experimental versions
echo "Removing experimental versions..."
rm -f Tab2AddCounterNew.tsx
rm -f Tab3AdminWorkNew.tsx

# Delete old index version
echo "Removing old index version..."
rm -f index_refactored.tsx

# Delete individual component files (now consolidated in Tab files)
echo "Removing individual component files..."
rm -f ASNTable.tsx
rm -f AddCounterModal.tsx
rm -f AddIPTModal.tsx
rm -f ApiMonitorBox.tsx
rm -f ConfigPolicerModal.tsx
rm -f ConfirmApplyModal.tsx
rm -f ConfirmModal.tsx
rm -f IPTMonitoringTable.tsx
rm -f LastWarningBox.tsx
rm -f LineChartIPT.tsx
rm -f ResultDisplayModal.tsx
rm -f ResultModal.tsx
rm -f SetTimeToRollbackModal.tsx
rm -f SetTriggerAlarmModal.tsx
rm -f TopASNTable.tsx

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "📂 Remaining files in /src/components/INOC1/I001:"
ls -lh

cd - > /dev/null

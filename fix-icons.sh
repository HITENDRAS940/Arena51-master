#!/bin/bash

# Script to fix react-native-vector-icons imports across the project

echo "🔧 Fixing icon imports across the project..."

# Array of files to fix
files=(
    "src/components/user/BookingCard.tsx"
    "src/components/user/TimeSlotCard.tsx"
    "src/components/admin/StatCard.tsx"
    "src/components/admin/AdminTurfCard.tsx"
    "src/components/shared/EmptyState.tsx"
    "src/screens/user/BookingSummaryScreen.tsx"
    "src/screens/user/TurfDetailScreen.tsx"
    "src/screens/user/ProfileScreen.tsx"
    "src/screens/admin/TurfManagementScreen.tsx"
    "src/screens/admin/AllBookingsScreen.tsx"
    "src/screens/admin/AdminMoreScreen.tsx"
)

# Function to fix icons in a file
fix_file() {
    local file="$1"
    echo "📝 Fixing: $file"
    
    # Replace import statement
    sed -i '' 's/import Icon from '\''react-native-vector-icons\/Ionicons'\'';/import { Ionicons } from '\''@expo\/vector-icons'\'';/g' "$file"
    
    # Replace Icon usages with Ionicons
    sed -i '' 's/<Icon name=/<Ionicons name=/g' "$file"
    sed -i '' 's/<\/Icon>/<\/Ionicons>/g' "$file"
}

# Fix each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        fix_file "$file"
        echo "✅ Fixed: $file"
    else
        echo "❌ File not found: $file"
    fi
done

echo "🎉 Icon fix script completed!"
echo "⚠️  Note: You may need to manually fix TypeScript type issues for icon names."

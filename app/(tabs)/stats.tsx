import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useHabits } from "../../hooks/useHabits";
import { API_URL } from "../../lib/utils";

export default function StatsScreen() {
  const { habits, loading, error } = useHabits(API_URL);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const totalHabits = habits.length;
  const totalCompleted = habits.reduce((sum, h) => sum + (h.totalCompleted || 0), 0);
  const avgStreak = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + (h.currentStreak || 0), 0) / habits.length)
    : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>Your progress overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCard1]}>
          <Text style={styles.statValue}>{totalHabits}</Text>
          <Text style={styles.statLabel}>Total Habits</Text>
        </View>

        <View style={[styles.statCard, styles.statCard2]}>
          <Text style={styles.statValue}>{totalCompleted}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={[styles.statCard, styles.statCard3]}>
          <Text style={styles.statValue}>{avgStreak}</Text>
          <Text style={styles.statLabel}>Avg Streak</Text>
        </View>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Habit Details</Text>
        
        {habits.length === 0 ? (
          <Text style={styles.emptyText}>No data yet 📊</Text>
        ) : (
          habits.map((habit) => (
            <View key={habit.name} style={styles.detailCard}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Current Streak:</Text>
                <Text style={styles.detailValue}>{habit.currentStreak || 0}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Best Streak:</Text>
                <Text style={styles.detailValue}>{habit.longestStreak || 0}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total:</Text>
                <Text style={styles.detailValue}>{habit.totalCompleted || 0}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  statCard1: {
    backgroundColor: "#dbeafe",
  },
  statCard2: {
    backgroundColor: "#dcfce7",
  },
  statCard3: {
    backgroundColor: "#fef3c7",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
  },
  detailsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderColor: "#e2e8f0",
    borderWidth: 1,
  },
  habitName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginVertical: 32,
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
    marginVertical: 16,
  },
});

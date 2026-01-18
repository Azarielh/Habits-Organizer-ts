import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useHabits } from "../../hooks/useHabits";
import { API_URL } from "../../lib/utils";

export default function HabitsScreen() {
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Habits</Text>
        <Text style={styles.subtitle}>{habits.length} habits</Text>
      </View>

      <View style={styles.content}>
        {habits.length === 0 ? (
          <Text style={styles.emptyText}>No habits yet. Create one! ➕</Text>
        ) : (
          habits.map((habit) => (
            <View key={habit.name} style={styles.habitCard}>
              <View style={styles.habitHeader}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.frequency}>
                  {habit.iterations}x {typeof habit.frequency === "string" ? habit.frequency : "custom"}
                </Text>
              </View>
              {habit.description && (
                <Text style={styles.description}>{habit.description}</Text>
              )}
              <View style={styles.stats}>
                <Text style={styles.statItem}>Total: {habit.totalCompleted || 0}</Text>
                <Text style={styles.statItem}>Streak: {habit.currentStreak || 0}</Text>
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
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  habitCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderColor: "#e2e8f0",
    borderWidth: 1,
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  frequency: {
    fontSize: 12,
    color: "#0ea5e9",
    fontWeight: "500",
    backgroundColor: "#cffafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  description: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
    fontStyle: "italic",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    fontSize: 12,
    color: "#475569",
  },
  emptyText: {
    fontSize: 16,
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

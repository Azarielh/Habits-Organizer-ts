import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useHabits } from "../../hooks/useHabits";
import { API_URL } from "../../lib/utils";

export default function TodayScreen() {
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
        <Text style={styles.title}>Today's Habits</Text>
        <Text style={styles.subtitle}>{habits.length} habits total</Text>
      </View>

      <View style={styles.content}>
        {habits.length === 0 ? (
          <Text style={styles.emptyText}>No habits yet. Create one to get started! 🚀</Text>
        ) : (
          habits.map((habit) => (
            <View key={habit.name} style={styles.habitCard}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitDescription}>{habit.description || "No description"}</Text>
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
  habitName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  habitDescription: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
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

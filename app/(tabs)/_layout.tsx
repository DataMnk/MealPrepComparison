import React from "react";
import { Tabs } from "expo-router";
import { ClipboardCheck, FileText } from "lucide-react-native";
import colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Patient Form",
          tabBarIcon: ({ color }) => <ClipboardCheck size={24} color={color} />,
          tabBarLabel: "Form",
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: "AI Comparison",
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
          tabBarLabel: "Results",
        }}
      />
    </Tabs>
  );
}
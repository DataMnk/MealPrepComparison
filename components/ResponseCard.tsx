import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '@/constants/colors';

interface ResponseCardProps {
  title: string;
  content: string;
  source: 'chatgpt' | 'perplexity';
}

export default function ResponseCard({ title, content, source }: ResponseCardProps) {
  const sourceColor = source === 'chatgpt' ? colors.chatGpt : colors.perplexity;
  
  // Process markdown-like content for better display
  const processContent = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return (
          <Text key={index} style={styles.headerLarge}>
            {line.substring(2)}
          </Text>
        );
      }
      
      if (line.startsWith('## ')) {
        return (
          <Text key={index} style={styles.headerMedium}>
            {line.substring(3)}
          </Text>
        );
      }
      
      if (line.startsWith('### ')) {
        return (
          <Text key={index} style={styles.headerSmall}>
            {line.substring(4)}
          </Text>
        );
      }
      
      // List items
      if (line.startsWith('- ')) {
        return (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listBullet}>•</Text>
            <Text style={styles.text}>{line.substring(2)}</Text>
          </View>
        );
      }
      
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        const number = line.match(/^\d+/)?.[0] || '';
        return (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listNumber}>{number}.</Text>
            <Text style={styles.text}>{line.substring(number.length + 2)}</Text>
          </View>
        );
      }
      
      // Empty line
      if (line.trim() === '') {
        return <View key={index} style={styles.emptyLine} />;
      }
      
      // Regular text
      return (
        <Text key={index} style={styles.text}>
          {line}
        </Text>
      );
    });
  };
  
  return (
    <View style={[styles.container, { borderTopColor: sourceColor }]}>
      <View style={[styles.header, { backgroundColor: `${sourceColor}10` }]}>
        <Text style={[styles.title, { color: sourceColor }]}>{title}</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {processContent(content)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 8,
  },
  headerLarge: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  headerMedium: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  headerSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  listBullet: {
    fontSize: 15,
    marginRight: 8,
    color: colors.text,
  },
  listNumber: {
    fontSize: 15,
    marginRight: 8,
    color: colors.text,
  },
  emptyLine: {
    height: 12,
  },
});
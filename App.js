import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@nachrichten_bookmarks';

// Beispiel-Nachrichten als Initialdaten
const INITIAL_NEWS = [
  {
    id: '1',
    title: 'Neue Innovationen in der Mobile-Entwicklung',
    category: 'Technologie',
    date: '05.10.2026',
    content: 'Mit modernen Frameworks wie React Native und Expo lassen sich Apps heute komplett ohne lokalen Rechner direkt über mobile Workflows und GitHub Actions deployen.'
  },
  {
    id: '2',
    title: 'Globale Klimakonferenz erzielt Durchbruch',
    category: 'Politik',
    date: '04.10.2026',
    content: 'Internationale Vertreter einigen sich auf verbindliche Maßnahmen zur Reduktion von Emissionen in den kommenden fünf Jahren.'
  },
  {
    id: '3',
    title: 'Spannendes Finale in der Meisterschaft',
    category: 'Sport',
    date: '03.10.2026',
    content: 'In einem dramatischen Spiel sicherte sich das Außenseiter-Team in den letzten Sekunden den Titel der Saison.'
  }
];

export default function App() {
  const [news, setNews] = useState(INITIAL_NEWS);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lade gespeicherte Lesezeichen beim Start aus AsyncStorage
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (stored !== null) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (e) {
      Alert.alert('Fehler', 'Lesezeichen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (id) => {
    try {
      let updatedBookmarks;
      if (bookmarks.includes(id)) {
        updatedBookmarks = bookmarks.filter((bId) => bId !== id);
      } else {
        updatedBookmarks = [...bookmarks, id];
      }
      setBookmarks(updatedBookmarks);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    } catch (e) {
      Alert.alert('Fehler', 'Lesezeichen konnte nicht gespeichert werden.');
    }
  };

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBookmark = showOnlyBookmarks ? bookmarks.includes(item.id) : true;
    return matchesSearch && matchesBookmark;
  });

  const renderNewsItem = ({ item }) => {
    const isBookmarked = bookmarks.includes(item.id);
    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelectedNews(item)}>
        <View style={styles.cardHeader}>
          <Text style={styles.category}>{item.category.toUpperCase()}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.snippet} numberOfLines={2}>
          {item.content}
        </Text>
        <View style={styles.cardFooter}>
          <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
            <Text style={styles.bookmarkButton}>
              {isBookmarked ? '★ Lesezeichen entfernt' : '☆ Lesezeichen merken'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nachrichten App</Text>
      </View>

      {/* Suche & Filter */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nachrichten durchsuchen..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={[styles.filterToggle, showOnlyBookmarks && styles.filterToggleActive]}
          onPress={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
        >
          <Text style={[styles.filterToggleText, showOnlyBookmarks && styles.filterToggleTextActive]}>
            {showOnlyBookmarks ? 'Alle anzeigen' : 'Nur gemerkte'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        renderItem={renderNewsItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Keine Nachrichten gefunden.</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal visible={selectedNews !== null} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          {selectedNews && (
            <View style={styles.modalContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.category}>{selectedNews.category.toUpperCase()}</Text>
                <Text style={styles.date}>{selectedNews.date}</Text>
              </View>
              <Text style={styles.modalTitle}>{selectedNews.title}</Text>
              <Text style={styles.modalBody}>{selectedNews.content}</Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedNews(null)}
              >
                <Text style={styles.closeButtonText}>Schließen</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  filterContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  searchInput: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  filterToggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e4e6eb',
    alignSelf: 'flex-start',
  },
  filterToggleActive: {
    backgroundColor: '#0066cc',
  },
  filterToggleText: {
    color: '#050505',
    fontWeight: '600',
  },
  filterToggleTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  category: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  date: {
    fontSize: 12,
    color: '#8e8e93',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 6,
  },
  snippet: {
    fontSize: 14,
    color: '#3a3a3c',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  bookmarkButton: {
    fontSize: 13,
    color: '#0066cc',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalContent: {
    padding: 20,
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginVertical: 12,
  },
  modalBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3a3a3c',
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

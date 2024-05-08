import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import Icon from "react-native-elements/dist/icons/Icon";
import Item from "../../components/bookItem";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { addBook, delet_BooK, getBooks, getCategories, addCategory as addCategoryToFirestore,deleteCategory } from "../../firebase/firestore_fun"; // Rename addCategory import

export default function AdminIndex() {
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all books");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [booksData, setBooksData] = useState([]);
  const [newBookName, setNewBookName] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");
  const [newBookCategory, setNewBookCategory] = useState("");
  const [newBookImageUri, setNewBookImageUri] = useState("");
  const [newBookPrice, setNewBookPrice] = useState("");
  const fetchBooks = async () => {
    try {
      const books = await getBooks();
      setBooksData(books);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchCategories = async () => {
    try {
      const categories = await getCategories();
      setCategoryList(categories);
      categories.sort((a, b) => a.name.localeCompare(b.name));
      console.log(categoryList);
    } catch (error) {
      console.error(error);
    }
  };
  const addCategory = async () => {
    if (newCategoryName.trim() !== "") {
      const newCategory = {
        icon: newCategoryIcon,
        name: newCategoryName,
      };
      try {
        await addCategoryToFirestore(newCategory);
        fetchCategories();
      } catch (error) {
        console.error(error);
      }
      setNewCategoryName("");
      setNewCategoryIcon("");
      Alert.alert("Success", "New category added!");
    } else {
      Alert.alert("Error", "Please enter a category name.");
    }
  };
  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);
  const renderItem = ({ item }) => <Item item={item} onDeleteBook={deleteBook} />;
  const categoryItem = ({ item }) => (
    <View style={styles.categoryItemContainer}>
      <Pressable
        style={[
          styles.categoryItem,
          selectedCategory === item.name && styles.selectedCategory,
        ]}
        onPress={() => {
          setSelectedCategory(item.name);
        }}
      >
        <Icon
          name={item.icon}
          type="material"
          color={selectedCategory === item.name ? "#fff" : "#2C4E70"}
        />
        <Text
          style={{
            fontWeight: "bold",
            color: selectedCategory === item.name ? "#fff" : "#2C4E70",
            marginLeft: 10,
          }}
        >
          {item.name}
        </Text>
      </Pressable>
      <Pressable onPress={() => _deleteCategory(item)} style={styles.deleteCategoryButton}>
        <Icon name="delete" type="material" color="#FF6347" />
      </Pressable>
    </View>
  );
  const addNewBook = async () => {
    if (
      newBookName.trim() === "" ||
      newBookAuthor.trim() === "" ||
      newBookCategory.trim() === "" ||
      newBookImageUri.trim() === "" ||
      newBookPrice.trim() === ""
    ) {
      Alert.alert("Error", "Please enter book name, author, category, price, and image URI.");
      return;
    }
    if (newBookCategory === "all books") {
      Alert.alert("Error", "The book must have a specific category.");
      return;
    }
    const categoryExists = categoryList.some((category) => category.name === newBookCategory);
    if (!categoryExists) {
      Alert.alert("Error", "Category does not exist.");
      return;
    }
    try {
      const newBook = {
        id: booksData.length,
        name: newBookName,
        author: newBookAuthor,
        category: newBookCategory,
        price: newBookPrice,
        imageUri: newBookImageUri,
      };
      await addBook(newBook);
      setBooksData((prevBooks) => [...prevBooks, newBook]);
      setNewBookName("");
      setNewBookAuthor("");
      setNewBookCategory("");
      setNewBookPrice("");
      setNewBookImageUri("");
      Alert.alert("Success", "New book added.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add new book.");
    }
  };
  const _deleteCategory =async (category) => {
   try {
     console.log("Deleting category:", category.name);
     await deleteCategory(category);
     const updatedCategories = categoryList.filter((_category) => _category.id !== category.id);
     const updatedBooks = booksData.filter((book) => book.category !== category.name);
     setCategoryList(updatedCategories);
     setBooksData(updatedBooks);
   } catch (error) {
    console.error(error);
   }
  };
  const deleteBook = (id) => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          await delet_BooK(booksData.filter((book) => book.id == id));
          const updatedBooks = booksData.filter((book) => book.id !== id);
          setBooksData(updatedBooks);
        },
      },
    ]);
  };
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="New category name"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Icon"
            value={newCategoryIcon}
            onChangeText={setNewCategoryIcon}
          />
          <Pressable style={styles.addButton} onPress={addCategory}>
            <Icon name="add" type="material" color="#2C4E70" />
            <Text style={styles.buttonText}>Add category</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="New book name"
            value={newBookName}
            onChangeText={setNewBookName}
          />
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Author"
            value={newBookAuthor}
            onChangeText={setNewBookAuthor}
          />
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Category"
            value={newBookCategory}
            onChangeText={setNewBookCategory}
          />
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Price"
            value={newBookPrice}
            onChangeText={setNewBookPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.imageInput]}
            placeholder="Image URL"
            value={newBookImageUri}
            onChangeText={setNewBookImageUri}
          />
        </View>
        <Pressable style={styles.addButton} onPress={addNewBook}>
          <Icon name="add" type="material" color="#2C4E70" />
          <Text style={styles.buttonText}>Add book</Text>
        </Pressable>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Categories</Text>
        <FlatList
          data={categoryList}
          renderItem={categoryItem}
          horizontal={true}
          // keyExtractor={(item) => item.id.toString()}
        />
      </View>
      <FlatList
        contentContainerStyle={styles.flatListContainer}
        data={booksData.filter((book) => book.category === selectedCategory || selectedCategory === "all books")}
        renderItem={renderItem}
        // keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  input: {
    flexBasis: "48%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 5,
  },
  smallInput: {
    flexBasis: "48%",
    height: 40,
    marginBottom: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#B3C8CF",
  },
  buttonText: {
    marginLeft: 10,
    color: "#2C4E70",
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#2C4E70",
    marginBottom: 10,
    marginLeft: 20,
  },
  flatListContainer: {
    paddingHorizontal: 10,
  },
  categoryItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#BED7DC",
  },
  selectedCategory: {
    backgroundColor: "#ccc",
  },
  deleteCategoryButton: {
    marginLeft: 5,
  },
  imageInput: {
    flexBasis: "98%",
    height: 40,
    marginBottom: 10,
  },
});

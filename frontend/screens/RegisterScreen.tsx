  import React, { useState } from "react";
  import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
  } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { LinearGradient } from 'expo-linear-gradient';
  import { API_URL } from "../config/api";


  // const API_URL = "http://10.211.87.117:5000";



  export default function RegisterScreen({ navigation }: any) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
      if (!username || !email || !password) {
        Alert.alert("Missing input", "Please fill in all fields");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();
        console.log("Register response:", data);

        if (response.ok) {
          Alert.alert("Success", "Account created successfully!");
          navigation.navigate("LoginScreen");
        } else {
          Alert.alert("Error", data.message || "Registration failed");
        }
      } catch (error) {
        console.error("Register error:", error);
        Alert.alert("Error", "Cannot connect to the server");
      }
    };

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <LinearGradient
          colors={['#f093fb', '#f5576c', '#4facfe']}
          style={styles.gradient}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>Join us today</Text>
                </View>

                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                      placeholder="Choose a username"
                      placeholderTextColor="#999"
                      value={username}
                      onChangeText={setUsername}
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      placeholder="Enter your email"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      placeholder="Create a password"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>

                  <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Create Account</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => navigation.navigate("LoginScreen")}
                    style={styles.linkContainer}
                  >
                    <Text style={styles.linkText}>
                      Already have an account? <Text style={styles.linkBold}>Sign In</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f093fb',
    },
    gradient: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingVertical: 20,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    header: {
      marginBottom: 40,
    },
    title: {
      fontSize: 36,
      fontWeight: "800",
      color: "#fff",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: "rgba(255, 255, 255, 0.8)",
    },
    form: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: 24,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: "#333",
      marginBottom: 8,
    },
    input: {
      backgroundColor: "#f5f5f5",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: "#333",
    },
    button: {
      backgroundColor: "#f5576c",
      padding: 18,
      borderRadius: 12,
      marginTop: 8,
      shadowColor: "#f5576c",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "700",
      fontSize: 16,
    },
    linkContainer: {
      marginTop: 20,
      alignItems: "center",
    },
    linkText: {
      textAlign: "center",
      color: "#666",
      fontSize: 14,
    },
    linkBold: {
      color: "#f5576c",
      fontWeight: "700",
    },
  });
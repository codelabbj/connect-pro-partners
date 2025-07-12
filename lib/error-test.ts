// Test utility to demonstrate error message extraction
import { extractErrorMessages } from "@/components/ui/error-display"

// Test cases for different API error formats
export function testErrorExtraction() {
  const testCases = [
    // Your example
    {
      name: "Django REST Framework detail error",
      error: { "detail": "Method \"GET\" not allowed." },
      expected: "Method \"GET\" not allowed."
    },
    // Other common formats
    {
      name: "Message field error",
      error: { "message": "User not found" },
      expected: "User not found"
    },
    {
      name: "Error field error",
      error: { "error": "Invalid credentials" },
      expected: "Invalid credentials"
    },
    {
      name: "Field-specific errors",
      error: { 
        "email": ["This field is required", "Enter a valid email address"],
        "password": ["Password is too short"]
      },
      expected: "email: This field is required, Enter a valid email address; password: Password is too short"
    },
    {
      name: "String error",
      error: "Network connection failed",
      expected: "Network connection failed"
    },
    {
      name: "Null error",
      error: null,
      expected: "An unknown error occurred"
    },
    {
      name: "Array of errors",
      error: ["Error 1", "Error 2"],
      expected: "Error 1 Error 2"
    }
  ]

  console.log("Testing error message extraction:")
  testCases.forEach(({ name, error, expected }) => {
    const result = extractErrorMessages(error)
    const passed = result === expected
    console.log(`${passed ? "✅" : "❌"} ${name}:`)
    console.log(`  Input: ${JSON.stringify(error)}`)
    console.log(`  Expected: "${expected}"`)
    console.log(`  Got: "${result}"`)
    console.log("")
  })
}

// Example usage in your app
export function handleApiError(error: any) {
  const userFriendlyMessage = extractErrorMessages(error)
  
  // Now you can display this user-friendly message
  console.log("User-friendly error message:", userFriendlyMessage)
  
  // Example: Show in toast or error display
  // toast({
  //   title: "Error",
  //   description: userFriendlyMessage,
  //   variant: "destructive"
  // })
} 
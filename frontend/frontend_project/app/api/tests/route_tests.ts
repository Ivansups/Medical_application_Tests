import { error } from "console";
import { UUID } from "crypto";
import { request } from "https"
import { escape } from "querystring";

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return 'http://localhost:8000';
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

const API_BASE_URL = getApiBaseUrl

export async function getAllTests() {
    try {
        const res = await fetch(`${API_BASE_URL}/tests`)
        if (!res.ok) 
            throw new Error("some get wrong...")
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function getTestById(test_id: UUID) {
    try {
        const res = await fetch(`${API_BASE_URL}/tests/${test_id}`)
        if (!res.ok) 
          throw new Error(`HTTP ${res.status} - Failed to load test ${test_id}`); 
        return res.json()       
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function createNewTest(test: {
    title: string
    description: string
    duration: number
}) {
    
}

export async function getAllEndpointsForDatabaseTests() {
    const endpoints = [
        
    ]
}

interface test {
    title: string
    description: string
    duration: number
}
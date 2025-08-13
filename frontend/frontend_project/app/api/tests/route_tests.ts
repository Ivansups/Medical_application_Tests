import { error } from "console";
import { UUID } from "crypto";
import { request } from "https"
import { escape } from "querystring";
import { types } from "util";
import { Create_test, Test } from "@/types/test";

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return 'http://localhost:8000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

const API_BASE_URL = getApiBaseUrl()

export async function getAllTests() {
    try {
        const res = await fetch(`${API_BASE_URL}/tests`)
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || `HTTP ${res.status} - Request failed`);    
        }
        return res.json()
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function getTestById(test_id: UUID) {
    try {
        const res = await fetch(`${API_BASE_URL}/tests/${test_id}`)
        if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || `HTTP ${res.status} - Request failed`);
        }
        return res.json()       
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function createNewTest(test_data: Create_test) {
    try {
        const res = await fetch(`${API_BASE_URL}/tests`, {
            method: "POST",
            headers:{
                'Content-Type': 'application/json',
            },
                  body: JSON.stringify(test_data)
        })
        if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || `HTTP ${res.status} - Request failed`);
        }
        return res.json()
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function updateTest(test_data: Promise<Create_test>, test_id: UUID) {
    try {
        const res = await fetch(`${API_BASE_URL}/tests/${test_id}`, {
            method: "PUT",
            headers:{
                'Content-Type': 'application/json',
            },
                  body: JSON.stringify(test_data)
        })
        if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || `HTTP ${res.status} - Failed to update test`);
        }
        return res.json() as Promise<Test>
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function deleteTestByID(test_id:UUID) {
    try {
        const res = await fetch(`${API_BASE_URL}/tests/${test_id}`, {
            method: "DELETE",
            headers:{
                'Content-Type': 'application/json',
            },
        }
        )
        if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || `HTTP ${res.status} - Failed to update test`);
        }
    } catch (error) {
        console.log(error)
        throw error
    }
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
package com.example.mylib.enums;

public enum BorrowStatus {
    BORROWED,    // Book is currently borrowed by the user
    RETURNED,    // Book has been returned
    PENDING,     // Initial request to borrow is waiting for admin approval
    RETURN_PENDING; // Request to return the book is waiting for admin approval
}

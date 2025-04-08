package com.example.mylib.payload;

import java.io.File;

public class AppConstants {

    // Without static, each instance would have its own copy, wasting memory
    public static final int MAX_BOOK_RESERVATION = 5;
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_STUDENT = "ROLE_STUDENT";
    public static final String ROLE_LIBRARIAN = "ROLE_LIBRARIAN";
    public static final int BORROW_DAYS_LIMIT = 14; // Books are due in 14 days
    public static final double FINE_PER_DAY = 10.0; // Fine per overdue day

    public static final int CONTACT_IMAGE_HEIGHT = 500;
    public static final int CONTACT_IMAGE_WIDTH = 500;
    public static final String CONTACT_IMAGE_CROP = "fill";

}

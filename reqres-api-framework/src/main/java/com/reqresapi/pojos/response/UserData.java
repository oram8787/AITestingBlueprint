package com.reqresapi.pojos.response;

import com.google.gson.annotations.SerializedName;

public class UserData {
    private int id;
    private String email;

    @SerializedName("first_name")
    private String firstName;

    @SerializedName("last_name")
    private String lastName;

    private String avatar;

    public int getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getAvatar() { return avatar; }
}

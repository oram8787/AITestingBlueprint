package com.reqresapi.modules;

import com.github.javafaker.Faker;
import com.google.gson.Gson;
import com.reqresapi.pojos.request.CreateUserRequest;
import com.reqresapi.pojos.request.LoginRequest;
import com.reqresapi.pojos.response.CreateUserResponse;
import com.reqresapi.pojos.response.ListUsersResponse;
import com.reqresapi.pojos.response.LoginResponse;
import com.reqresapi.pojos.response.SingleUserResponse;

import java.io.IOException;
import java.util.Properties;

public class PayloadManager {

    private final Gson gson = new Gson();
    private final Faker faker = new Faker();
    private Properties props;

    public PayloadManager() {
        loadProperties();
    }

    private void loadProperties() {
        props = new Properties();
        try (var stream = Thread.currentThread().getContextClassLoader()
                .getResourceAsStream("data.properties")) {
            if (stream == null) throw new RuntimeException("data.properties not found on classpath");
            props.load(stream);
        } catch (IOException e) {
            throw new RuntimeException("Cannot load data.properties", e);
        }
    }

    // --- Config ---

    public String getApiKey() {
        return props.getProperty("api.key");
    }

    // --- Request Payloads (Serialization) ---

    public String loginPayload() {
        LoginRequest req = new LoginRequest(
                props.getProperty("auth.email"),
                props.getProperty("auth.password")
        );
        return gson.toJson(req);
    }

    public String loginInvalidPayload() {
        LoginRequest req = new LoginRequest("invalid@user.com", "");
        return gson.toJson(req);
    }

    public String createUserPayload() {
        CreateUserRequest req = new CreateUserRequest(
                faker.name().fullName(),
                faker.job().title()
        );
        return gson.toJson(req);
    }

    public String createUserPayload(String name, String job) {
        return gson.toJson(new CreateUserRequest(name, job));
    }

    public String updateUserPayload(String name, String job) {
        return gson.toJson(new CreateUserRequest(name, job));
    }

    // --- Response Deserialization ---

    public LoginResponse parseLoginResponse(String json) {
        return gson.fromJson(json, LoginResponse.class);
    }

    public CreateUserResponse parseCreateUserResponse(String json) {
        return gson.fromJson(json, CreateUserResponse.class);
    }

    public SingleUserResponse parseSingleUserResponse(String json) {
        return gson.fromJson(json, SingleUserResponse.class);
    }

    public ListUsersResponse parseListUsersResponse(String json) {
        return gson.fromJson(json, ListUsersResponse.class);
    }
}

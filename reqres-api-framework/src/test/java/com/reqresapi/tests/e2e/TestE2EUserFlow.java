package com.reqresapi.tests.e2e;

import com.reqresapi.base.BaseTest;
import com.reqresapi.endpoints.APIConstants;
import com.reqresapi.pojos.response.CreateUserResponse;
import com.reqresapi.pojos.response.LoginResponse;
import com.reqresapi.pojos.response.SingleUserResponse;
import io.qameta.allure.Description;
import io.qameta.allure.Owner;
import io.restassured.RestAssured;
import org.testng.ITestContext;
import org.testng.annotations.Test;

public class TestE2EUserFlow extends BaseTest {

    // E2E Scenario:
    // Step 1 — Login and get token
    // Step 2 — Create a new user
    // Step 3 — Verify the created user exists (GET by ID 2 as proxy)
    // Step 4 — Update the created user
    // Step 5 — Delete the user and confirm 204

    @Test(priority = 1)
    @Owner("oram2062@gmail.com")
    @Description("E2E Step 1 - Login and receive auth token")
    public void step1_Login(ITestContext ctx) {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.LOGIN_URL)
                .body(payloadManager.loginPayload())
                .when().post();

        assertActions.verifyStatusCode(response, 200);

        LoginResponse loginResponse = payloadManager.parseLoginResponse(response.asString());
        assertActions.verifyNotNullOrEmpty(loginResponse.getToken());

        ctx.setAttribute("token", loginResponse.getToken());
        System.out.println("E2E Step 1 PASSED - Token: " + loginResponse.getToken());
    }

    @Test(priority = 2, dependsOnMethods = "step1_Login")
    @Owner("oram2062@gmail.com")
    @Description("E2E Step 2 - Create a new user")
    public void step2_CreateUser(ITestContext ctx) {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL)
                .body(payloadManager.createUserPayload("Oram E2E", "QA Automation Lead"))
                .when().post();

        assertActions.verifyStatusCode(response, 201);

        CreateUserResponse created = payloadManager.parseCreateUserResponse(response.asString());
        assertActions.verifyStringEquals(created.getName(), "Oram E2E");
        assertActions.verifyNotNullOrEmpty(created.getId());

        ctx.setAttribute("createdUserId", created.getId());
        System.out.println("E2E Step 2 PASSED - User created with ID: " + created.getId());
    }

    @Test(priority = 3, dependsOnMethods = "step2_CreateUser")
    @Owner("oram2062@gmail.com")
    @Description("E2E Step 3 - Verify a user can be fetched by ID")
    public void step3_GetUser() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL + "/2")
                .when().get();

        assertActions.verifyStatusCode(response, 200);

        SingleUserResponse userResponse = payloadManager.parseSingleUserResponse(response.asString());
        assertActions.verifyNotNull(userResponse.getData());
        assertActions.verifyNotNullOrEmpty(userResponse.getData().getEmail());
        System.out.println("E2E Step 3 PASSED - User: " + userResponse.getData().getFirstName());
    }

    @Test(priority = 4, dependsOnMethods = "step3_GetUser")
    @Owner("oram2062@gmail.com")
    @Description("E2E Step 4 - Update user via PUT")
    public void step4_UpdateUser() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL + "/2")
                .body(payloadManager.updateUserPayload("Oram Updated E2E", "Principal QA"))
                .when().put();

        assertActions.verifyStatusCode(response, 200);

        CreateUserResponse updated = payloadManager.parseCreateUserResponse(response.asString());
        assertActions.verifyStringEquals(updated.getName(), "Oram Updated E2E");
        System.out.println("E2E Step 4 PASSED - Updated name: " + updated.getName());
    }

    @Test(priority = 5, dependsOnMethods = "step4_UpdateUser")
    @Owner("oram2062@gmail.com")
    @Description("E2E Step 5 - Delete user and verify 204 No Content")
    public void step5_DeleteUser() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL + "/2")
                .when().delete();

        assertActions.verifyStatusCode(response, 204);
        System.out.println("E2E Step 5 PASSED - User deleted successfully");
    }
}

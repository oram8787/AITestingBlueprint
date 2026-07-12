package com.reqresapi.tests.crud;

import com.reqresapi.base.BaseTest;
import com.reqresapi.endpoints.APIConstants;
import com.reqresapi.pojos.response.ListUsersResponse;
import com.reqresapi.pojos.response.SingleUserResponse;
import io.qameta.allure.Description;
import io.qameta.allure.Owner;
import io.restassured.RestAssured;
import org.testng.annotations.Test;

public class TestGetUsers extends BaseTest {

    @Test(priority = 1)
    @Owner("oram2062@gmail.com")
    @Description("TC#GET01 - List all users on page 1 and verify pagination fields")
    public void testListUsers() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL)
                .queryParam("page", 1)
                .when().get();

        validatableResponse = response.then().log().all();
        assertActions.verifyStatusCode(response, 200);

        ListUsersResponse listResponse = payloadManager.parseListUsersResponse(response.asString());
        assertActions.verifyNotNull(listResponse.getData());
        assertActions.verifyIntGreaterThan(listResponse.getTotal(), 0);
        assertActions.verifyIntGreaterThan(listResponse.getData().size(), 0);
        System.out.println("Total users: " + listResponse.getTotal());
    }

    @Test(priority = 2)
    @Owner("oram2062@gmail.com")
    @Description("TC#GET02 - Get a single user by ID and verify fields")
    public void testGetSingleUser() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL + "/2")
                .when().get();

        validatableResponse = response.then().log().all();
        assertActions.verifyStatusCode(response, 200);

        SingleUserResponse userResponse = payloadManager.parseSingleUserResponse(response.asString());
        assertActions.verifyNotNull(userResponse.getData());
        assertActions.verifyNotNullOrEmpty(userResponse.getData().getEmail());
        assertActions.verifyNotNullOrEmpty(userResponse.getData().getFirstName());
        System.out.println("User email: " + userResponse.getData().getEmail());
    }

    @Test(priority = 3)
    @Owner("oram2062@gmail.com")
    @Description("TC#GET03 - Get a non-existent user returns 404")
    public void testGetUserNotFound() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL + "/999")
                .when().get();

        validatableResponse = response.then().log().all();
        assertActions.verifyStatusCode(response, 404);
    }
}

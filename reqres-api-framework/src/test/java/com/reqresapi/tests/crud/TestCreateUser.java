package com.reqresapi.tests.crud;

import com.reqresapi.base.BaseTest;
import com.reqresapi.endpoints.APIConstants;
import com.reqresapi.pojos.response.CreateUserResponse;
import io.qameta.allure.Description;
import io.qameta.allure.Owner;
import io.restassured.RestAssured;
import org.testng.annotations.Test;

public class TestCreateUser extends BaseTest {

    @Test(priority = 1)
    @Owner("oram2062@gmail.com")
    @Description("TC#POST01 - Create a user with random Faker data and verify 201 + fields")
    public void testCreateUserWithFaker() {
        String payload = payloadManager.createUserPayload();
        System.out.println("Payload: " + payload);

        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL)
                .body(payload)
                .when().post();

        validatableResponse = response.then().log().all();
        assertActions.verifyStatusCode(response, 201);

        CreateUserResponse created = payloadManager.parseCreateUserResponse(response.asString());
        assertActions.verifyNotNullOrEmpty(created.getId());
        assertActions.verifyNotNullOrEmpty(created.getCreatedAt());
        assertActions.verifyNotNullOrEmpty(created.getName());
        System.out.println("Created user ID: " + created.getId());
    }

    @Test(priority = 2)
    @Owner("oram2062@gmail.com")
    @Description("TC#POST02 - Create a user with fixed data and verify name/job in response")
    public void testCreateUserWithFixedData() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL)
                .body(payloadManager.createUserPayload("Oram", "QA Engineer"))
                .when().post();

        validatableResponse = response.then().log().all();
        assertActions.verifyStatusCode(response, 201);

        CreateUserResponse created = payloadManager.parseCreateUserResponse(response.asString());
        assertActions.verifyStringEquals(created.getName(), "Oram");
        assertActions.verifyStringEquals(created.getJob(), "QA Engineer");
    }
}

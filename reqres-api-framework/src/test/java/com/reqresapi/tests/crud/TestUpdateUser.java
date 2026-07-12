package com.reqresapi.tests.crud;

import com.reqresapi.base.BaseTest;
import com.reqresapi.endpoints.APIConstants;
import com.reqresapi.pojos.response.CreateUserResponse;
import io.qameta.allure.Description;
import io.qameta.allure.Owner;
import io.restassured.RestAssured;
import org.testng.annotations.Test;

public class TestUpdateUser extends BaseTest {

    @Test(priority = 1)
    @Owner("oram2062@gmail.com")
    @Description("TC#PUT01 - Full update (PUT) of user ID 2 and verify updated fields")
    public void testFullUpdateUser() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL + "/2")
                .body(payloadManager.updateUserPayload("Oram Updated", "Senior QA"))
                .when().put();

        validatableResponse = response.then().log().all();
        assertActions.verifyStatusCode(response, 200);

        CreateUserResponse updated = payloadManager.parseCreateUserResponse(response.asString());
        assertActions.verifyStringEquals(updated.getName(), "Oram Updated");
        assertActions.verifyStringEquals(updated.getJob(), "Senior QA");
        assertActions.verifyNotNullOrEmpty(updated.getCreatedAt());
    }

    @Test(priority = 2)
    @Owner("oram2062@gmail.com")
    @Description("TC#PATCH01 - Partial update (PATCH) of user ID 2 and verify updated name")
    public void testPartialUpdateUser() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL + "/2")
                .body(payloadManager.updateUserPayload("Oram Patched", "Lead QA"))
                .when().patch();

        validatableResponse = response.then().log().all();
        assertActions.verifyStatusCode(response, 200);

        CreateUserResponse patched = payloadManager.parseCreateUserResponse(response.asString());
        assertActions.verifyStringEquals(patched.getName(), "Oram Patched");
    }
}

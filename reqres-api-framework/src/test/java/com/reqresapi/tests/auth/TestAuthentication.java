package com.reqresapi.tests.auth;

import com.reqresapi.base.BaseTest;
import com.reqresapi.endpoints.APIConstants;
import com.reqresapi.pojos.response.LoginResponse;
import io.qameta.allure.Description;
import io.qameta.allure.Owner;
import io.restassured.RestAssured;
import org.testng.annotations.Test;

public class TestAuthentication extends BaseTest {

    @Test(priority = 1)
    @Owner("oram2062@gmail.com")
    @Description("TC#AUTH01 - Successful login returns a valid token")
    public void testSuccessfulLogin() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.LOGIN_URL)
                .body(payloadManager.loginPayload())
                .when().post();

        validatableResponse = response.then().log().all();
        assertActions.verifyStatusCode(response, 200);

        LoginResponse loginResponse = payloadManager.parseLoginResponse(response.asString());
        assertActions.verifyNotNullOrEmpty(loginResponse.getToken());
        System.out.println("Token: " + loginResponse.getToken());
    }

    @Test(priority = 2)
    @Owner("oram2062@gmail.com")
    @Description("TC#AUTH02 - Login with invalid credentials returns 400")
    public void testFailedLogin() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.LOGIN_URL)
                .body(payloadManager.loginInvalidPayload())
                .when().post();

        validatableResponse = response.then().log().all();
        assertActions.verifyStatusCode(response, 400);

        LoginResponse loginResponse = payloadManager.parseLoginResponse(response.asString());
        assertActions.verifyNotNullOrEmpty(loginResponse.getError());
    }
}

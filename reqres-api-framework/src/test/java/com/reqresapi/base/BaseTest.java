package com.reqresapi.base;

import com.reqresapi.asserts.AssertActions;
import com.reqresapi.endpoints.APIConstants;
import com.reqresapi.modules.PayloadManager;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.response.ValidatableResponse;
import io.restassured.specification.RequestSpecification;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;

public class BaseTest {

    public RequestSpecification requestSpec;
    public AssertActions assertActions;
    public PayloadManager payloadManager;
    public Response response;
    public ValidatableResponse validatableResponse;

    @BeforeClass
    public void setup() {
        payloadManager  = new PayloadManager();
        assertActions   = new AssertActions();

        requestSpec = new RequestSpecBuilder()
                .setBaseUri(APIConstants.BASE_URL)
                .setContentType(ContentType.JSON)
                .addHeader("x-api-key", payloadManager.getApiKey())
                .build()
                .log().all();
    }

    public String getAuthToken() {
        Response res = RestAssured.given()
                .baseUri(APIConstants.BASE_URL)
                .contentType(ContentType.JSON)
                .header("x-api-key", payloadManager.getApiKey())
                .body(payloadManager.loginPayload())
                .when().post(APIConstants.LOGIN_URL);
        return payloadManager.parseLoginResponse(res.asString()).getToken();
    }

    @AfterClass
    public void tearDown() {
        System.out.println("Test finished.");
    }
}

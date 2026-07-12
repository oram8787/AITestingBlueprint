package com.reqresapi.pojos.response;

import java.util.List;

public class ListUsersResponse {
    private int page;
    private int per_page;
    private int total;
    private int total_pages;
    private List<UserData> data;

    public int getPage() { return page; }
    public int getPerPage() { return per_page; }
    public int getTotal() { return total; }
    public int getTotalPages() { return total_pages; }
    public List<UserData> getData() { return data; }
}

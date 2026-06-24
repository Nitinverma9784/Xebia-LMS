package com.geeknito.LMS_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryResponse {

    private String name;

    private String icon;

    private String description;

    private String color;

    private Boolean isActive;
}
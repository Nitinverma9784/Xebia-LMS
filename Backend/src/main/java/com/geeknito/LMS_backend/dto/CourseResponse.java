package com.geeknito.LMS_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourseResponse {

    private Long id;

    private String title;

    private String slug;

    private String description;

    private String shortDescription;

    private String level;

    private String language;

    private String duration;

    private String icon;

    private String thumbnail;

    private String bannerImage;

    private Boolean isActive;
}
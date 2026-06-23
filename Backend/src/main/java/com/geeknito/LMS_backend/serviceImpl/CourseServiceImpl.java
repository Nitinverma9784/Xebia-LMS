package com.geeknito.LMS_backend.serviceImpl;

import com.geeknito.LMS_backend.dto.CourseRequest;
import com.geeknito.LMS_backend.entity.learning.CategoryEntity;
import com.geeknito.LMS_backend.entity.learning.CourseEntity;
import com.geeknito.LMS_backend.exception.ResourceNotFoundException;
import com.geeknito.LMS_backend.repository.CategoryRepository;
import com.geeknito.LMS_backend.repository.CourseRepository;
import com.geeknito.LMS_backend.service.CourseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;

    public CourseServiceImpl(CourseRepository courseRepository, CategoryRepository categoryRepository) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CourseEntity create(CourseRequest request) {
        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        CourseEntity course = CourseEntity.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .level(request.getLevel())
                .language(request.getLanguage())
                .duration(request.getDuration())
                .icon(request.getIcon())
                .thumbnail(request.getThumbnail())
                .bannerImage(request.getBannerImage())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                
                // SEO CORE
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .metaKeywords(request.getMetaKeywords())
                .canonicalUrl(request.getCanonicalUrl())
                
                // ADVANCED SEO
                .primaryKeyword(request.getPrimaryKeyword())
                .secondaryKeywords(request.getSecondaryKeywords())
                .focusKeywords(request.getFocusKeywords())
                .robots(request.getRobots() != null ? request.getRobots() : "index, follow")
                .author(request.getAuthor())
                .seoCategory(request.getSeoCategory())
                .seoTags(request.getSeoTags())
                
                // OPEN GRAPH SEO
                .ogTitle(request.getOgTitle())
                .ogDescription(request.getOgDescription())
                .ogImage(request.getOgImage())
                .ogUrl(request.getOgUrl())
                .ogType(request.getOgType() != null ? request.getOgType() : "website")
                
                // TWITTER / X SEO
                .twitterTitle(request.getTwitterTitle())
                .twitterDescription(request.getTwitterDescription())
                .twitterImage(request.getTwitterImage())
                .twitterCard(request.getTwitterCard() != null ? request.getTwitterCard() : "summary_large_image")
                
                // STRUCTURED DATA
                .schemaMarkup(request.getSchemaMarkup())
                .faqSchema(request.getFaqSchema())
                .breadcrumbSchema(request.getBreadcrumbSchema())
                
                // COURSE CONTENT SEO
                .youtubeVideoUrl(request.getYoutubeVideoUrl())
                .previewVideoUrl(request.getPreviewVideoUrl())
                .learningOutcomes(request.getLearningOutcomes())
                .prerequisites(request.getPrerequisites())
                .targetAudience(request.getTargetAudience())
                .courseHighlights(request.getCourseHighlights())
                .careerOpportunities(request.getCareerOpportunities())
                
                // PROGRAMMATIC SEO
                .searchIntent(request.getSearchIntent())
                .semanticKeywords(request.getSemanticKeywords())
                .relatedTopics(request.getRelatedTopics())
                .searchSynonyms(request.getSearchSynonyms())
                
                // FAQ CONTENT
                .faqContent(request.getFaqContent())
                
                // CUSTOM SEO CONTENT
                .customHeadScript(request.getCustomHeadScript())
                .customBodyScript(request.getCustomBodyScript())
                
                // ANALYTICS
                .totalViews(request.getTotalViews() != null ? request.getTotalViews() : 0L)
                .totalClicks(request.getTotalClicks() != null ? request.getTotalClicks() : 0L)
                .ctr(request.getCtr() != null ? request.getCtr() : 0.0)
                .seoScore(request.getSeoScore() != null ? request.getSeoScore() : 0)
                
                // FLAGS
                .isPublished(request.getIsPublished() != null ? request.getIsPublished() : false)
                .allowIndexing(request.getAllowIndexing() != null ? request.getAllowIndexing() : true)
                .showInSearch(request.getShowInSearch() != null ? request.getShowInSearch() : true)
                
                // RELATIONSHIP
                .category(category)
                .build();

        return courseRepository.save(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseEntity> getAll() {
        return courseRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public CourseEntity getById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    @Override
    public CourseEntity update(Long id, CourseRequest request) {
        CourseEntity course = getById(id);
        
        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        course.setTitle(request.getTitle());
        course.setSlug(request.getSlug());
        course.setDescription(request.getDescription());
        course.setShortDescription(request.getShortDescription());
        course.setLevel(request.getLevel());
        course.setLanguage(request.getLanguage());
        course.setDuration(request.getDuration());
        course.setIcon(request.getIcon());
        course.setThumbnail(request.getThumbnail());
        course.setBannerImage(request.getBannerImage());
        
        if (request.getIsActive() != null) {
            course.setIsActive(request.getIsActive());
        }
        if (request.getIsFeatured() != null) {
            course.setIsFeatured(request.getIsFeatured());
        }

        // SEO CORE
        course.setMetaTitle(request.getMetaTitle());
        course.setMetaDescription(request.getMetaDescription());
        course.setMetaKeywords(request.getMetaKeywords());
        course.setCanonicalUrl(request.getCanonicalUrl());

        // ADVANCED SEO
        course.setPrimaryKeyword(request.getPrimaryKeyword());
        course.setSecondaryKeywords(request.getSecondaryKeywords());
        course.setFocusKeywords(request.getFocusKeywords());
        if (request.getRobots() != null) {
            course.setRobots(request.getRobots());
        }
        course.setAuthor(request.getAuthor());
        course.setSeoCategory(request.getSeoCategory());
        course.setSeoTags(request.getSeoTags());

        // OPEN GRAPH SEO
        course.setOgTitle(request.getOgTitle());
        course.setOgDescription(request.getOgDescription());
        course.setOgImage(request.getOgImage());
        course.setOgUrl(request.getOgUrl());
        if (request.getOgType() != null) {
            course.setOgType(request.getOgType());
        }

        // TWITTER / X SEO
        course.setTwitterTitle(request.getTwitterTitle());
        course.setTwitterDescription(request.getTwitterDescription());
        course.setTwitterImage(request.getTwitterImage());
        if (request.getTwitterCard() != null) {
            course.setTwitterCard(request.getTwitterCard());
        }

        // STRUCTURED DATA
        course.setSchemaMarkup(request.getSchemaMarkup());
        course.setFaqSchema(request.getFaqSchema());
        course.setBreadcrumbSchema(request.getBreadcrumbSchema());

        // COURSE CONTENT SEO
        course.setYoutubeVideoUrl(request.getYoutubeVideoUrl());
        course.setPreviewVideoUrl(request.getPreviewVideoUrl());
        course.setLearningOutcomes(request.getLearningOutcomes());
        course.setPrerequisites(request.getPrerequisites());
        course.setTargetAudience(request.getTargetAudience());
        course.setCourseHighlights(request.getCourseHighlights());
        course.setCareerOpportunities(request.getCareerOpportunities());

        // PROGRAMMATIC SEO
        course.setSearchIntent(request.getSearchIntent());
        course.setSemanticKeywords(request.getSemanticKeywords());
        course.setRelatedTopics(request.getRelatedTopics());
        course.setSearchSynonyms(request.getSearchSynonyms());

        // FAQ CONTENT
        course.setFaqContent(request.getFaqContent());

        // CUSTOM SEO CONTENT
        course.setCustomHeadScript(request.getCustomHeadScript());
        course.setCustomBodyScript(request.getCustomBodyScript());

        // ANALYTICS
        if (request.getTotalViews() != null) {
            course.setTotalViews(request.getTotalViews());
        }
        if (request.getTotalClicks() != null) {
            course.setTotalClicks(request.getTotalClicks());
        }
        if (request.getCtr() != null) {
            course.setCtr(request.getCtr());
        }
        if (request.getSeoScore() != null) {
            course.setSeoScore(request.getSeoScore());
        }

        // FLAGS
        if (request.getIsPublished() != null) {
            course.setIsPublished(request.getIsPublished());
        }
        if (request.getAllowIndexing() != null) {
            course.setAllowIndexing(request.getAllowIndexing());
        }
        if (request.getShowInSearch() != null) {
            course.setShowInSearch(request.getShowInSearch());
        }

        // RELATIONSHIP
        course.setCategory(category);

        return courseRepository.save(course);
    }

    @Override
    public void delete(Long id) {
        CourseEntity course = getById(id);
        courseRepository.delete(course);
    }
}

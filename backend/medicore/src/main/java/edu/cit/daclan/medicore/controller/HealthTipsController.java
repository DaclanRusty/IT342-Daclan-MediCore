package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.dto.response.ApiResponse;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class HealthTipsController {

    private static final String API_KEY = "RRF8XbO7O214YZsgSQr3XLbrpL0PnlXRiyWQJGEt";
    private static final String[] MUSCLES = {"chest", "biceps", "triceps", "abdominals", "lower_back", "hamstrings"};

    @GetMapping("/health-tips")
    public ResponseEntity<ApiResponse<List<String>>> getHealthTips() {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Api-Key", API_KEY);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            List<String> tips = new ArrayList<>();
            ObjectMapper mapper = new ObjectMapper();

            for (String muscle : MUSCLES) {
                String url = "https://api.api-ninjas.com/v1/exercises?muscle=" + muscle;
                ResponseEntity<String> response = restTemplate.exchange(
                        url, HttpMethod.GET, entity, String.class
                );

                JsonNode exercises = mapper.readTree(response.getBody());
                for (JsonNode ex : exercises) {
                    String name       = ex.path("name").asText();
                    String type       = ex.path("type").asText();
                    String equipment  = ex.path("equipment").asText();
                    String difficulty = ex.path("difficulty").asText();

                    String instructions = ex.path("instructions").asText();
                    String tip = name + " — Type: " + type +
                            (equipment != null && !equipment.isEmpty() ? ", Equipment: " + equipment : "") +
                            ", Difficulty: " + difficulty +
                            (!instructions.isEmpty() ? " | " + instructions : "");
                    tips.add(tip);
                }

                if (tips.size() >= 15) break;
            }

            if (tips.isEmpty()) return ResponseEntity.ok(ApiResponse.success(getFallbackTips()));
            return ResponseEntity.ok(ApiResponse.success(tips));

        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(getFallbackTips()));
        }
    }

    private List<String> getFallbackTips() {
        return List.of(
                " Push-Ups — A great bodyweight exercise for chest and arms.",
                " Jogging — Excellent cardio for overall health.",
                " Stretching — Improves flexibility and reduces injury risk.",
                " Squats — Strengthens legs and core muscles.",
                " Rest Days — Allow your muscles to recover and grow."
        );
    }
}
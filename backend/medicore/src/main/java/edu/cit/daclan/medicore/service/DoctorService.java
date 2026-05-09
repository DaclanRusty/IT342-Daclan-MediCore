package edu.cit.daclan.medicore.service;

import edu.cit.daclan.medicore.dto.DoctorProfileResponse;
import edu.cit.daclan.medicore.dto.DoctorProfileUpdateRequest;

public interface DoctorService {

    /** Returns the profile of the currently logged-in doctor. */
    DoctorProfileResponse getMyProfile(String email);

    /** Updates editable profile fields for the currently logged-in doctor. */
    DoctorProfileResponse updateMyProfile(String email, DoctorProfileUpdateRequest request);

    DoctorProfileResponse updateProfilePicture(String email, String base64Image);
}
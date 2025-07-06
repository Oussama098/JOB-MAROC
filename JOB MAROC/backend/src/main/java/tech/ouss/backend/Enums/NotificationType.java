package tech.ouss.backend.Enums;

public enum NotificationType {
    /**
     * When a candidate's application status changes (e.g., viewed, rejected, accepted).
     */
    APPLICATION_STATUS_UPDATE,

    /**
     * When a new message is received.
     */
    NEW_MESSAGE,

    NEW_OFFER_CREATED,

    UPDATED_OFFER,

    /**
     * When a talent successfully submits an application for an offer.
     */
    APPLICATION_SUBMITTED,

    /**
     * For a company, when a new candidate applies to one of their offers.
     */
    NEW_CANDIDATE_APPLICATION,

    NEW_USER_REGISTERED,

    UPDATE_USER_INFORMATIONS

}

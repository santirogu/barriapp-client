import type { components } from './generated/schema';

/** Convenience aliases for the API DTOs (components.schemas.*). */
type S = components['schemas'];

export type UserPublic = S['UserPublic'];
export type UserUpdate = S['UserUpdate'];
export type TokenResponse = S['TokenResponse'];
export type RegisterRequest = S['RegisterRequest'];
export type LoginRequest = S['LoginRequest'];
export type VerifyOtpRequest = S['VerifyOtpRequest'];
export type SocialLoginRequest = S['SocialLoginRequest'];

export type StorePublic = S['StorePublic'];
export type StoreCreate = S['StoreCreate'];
export type StoreUpdate = S['StoreUpdate'];
export type StoreLocation = S['StoreLocation'];
export type DeliveryConfig = S['DeliveryConfig'];
export type Schedule = S['Schedule'];

export type CategoryPublic = S['CategoryPublic'];
export type ProductPublic = S['ProductPublic'];
export type ProductCreate = S['ProductCreate'];
export type ProductUpdate = S['ProductUpdate'];

export type OrderPublic = S['OrderPublic'];
export type OrderCreate = S['OrderCreate'];
export type OrderItem = S['OrderItem'];
export type OrderItemInput = S['OrderItemInput'];
export type OrderAmounts = S['OrderAmounts'];

export type DeliveryPublic = S['DeliveryPublic'];
export type PaymentPublic = S['PaymentPublic'];
export type IntentResponse = S['IntentResponse'];

export type ErrandPublic = S['ErrandPublic'];
export type ErrandCreate = S['ErrandCreate'];

export type CollaboratorProfilePublic = S['CollaboratorProfilePublic'];
export type BecomeCollaborator = S['BecomeCollaborator'];
export type ReviewPublic = S['ReviewPublic'];
export type ReviewCreate = S['ReviewCreate'];
export type NotificationPublic = S['NotificationPublic'];

export type SubscriptionPublic = S['SubscriptionPublic'];
export type SettlementPublic = S['SettlementPublic'];
export type GenerateSettlement = S['GenerateSettlement'];

export type MetricsResponse = S['MetricsResponse'];
export type AuditLogPublic = S['AuditLogPublic'];
export type ConfigPublic = S['ConfigPublic'];
export type ConfigUpdate = S['ConfigUpdate'];

export type ChatRequest = S['ChatRequest'];
export type ChatResponse = S['ChatResponse'];
export type ConversationPublic = S['ConversationPublic'];

export type Address = S['Address'];
export type GeoPoint = S['GeoPoint'];
export type Rating = S['Rating'];

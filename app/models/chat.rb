class Chat < ApplicationRecord
  belongs_to :user
  has_many :messages, dependent: :destroy

  validates :uuid, presence: true, uniqueness: true

  validate :uuid_format

  MODELS = [
    {
      provider: "gemini",
      id: "gemini-2.0-flash",
      name: "gemini-2.0-flash",
      description: "次世代の機能と強化された機能を提供",
      access_token: Rails.application.credentials.dig(:gemini, :api_key),
      uri_base: "https://generativelanguage.googleapis.com/v1beta/openai/"
    },
    {
      provider: "openai",
      id: "gpt-4o",
      name: "gpt-4o",
      description: "汎用性と知能に優れたフラッグシップモデル",
      access_token: Rails.application.credentials.dig(:openai, :api_key),
      uri_base: nil # 指定不要
    }
  ]

  private

  UUID_REGEXP = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i

  def uuid_format
    unless uuid =~ UUID_REGEXP
      errors.add(:uuid, "must be a valid UUID format")
    end
  end
end

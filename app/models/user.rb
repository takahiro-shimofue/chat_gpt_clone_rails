class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :chats, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :email_address, presence: true, uniqueness: true

  class << self
    def authenticate_by_omniauth(auth)
      return unless auth.is_a?(Hash) && auth["provider"] == "google_oauth2"

      find_or_create_by(email_address: auth["info"]["email"]) do |user|
        user.password = SecureRandom.hex(16) # Generate a random password
      end
    end
  end
end

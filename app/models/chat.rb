class Chat < ApplicationRecord
  belongs_to :user
  has_many :messages, dependent: :destroy

  validates :uuid, presence: true, uniqueness: true

  validate :uuid_format

  private

  UUID_REGEXP = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i

  def uuid_format
    unless uuid =~ UUID_REGEXP
      errors.add(:uuid, "must be a valid UUID format")
    end
  end
end

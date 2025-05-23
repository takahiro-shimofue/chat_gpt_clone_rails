class RegistrationsController < ApplicationController
  skip_before_action :require_authentication, only: [ :new, :create ]
  def new
  end

  def create
    user = User.new(params.permit(:email_address, :password))
    if user.save
      start_new_session_for user
      redirect_to after_authentication_url, notice: "アカウントが作成されました。", status: :see_other
    else
      flash.now[:alert] = "アカウントの作成に失敗しました。"
      render :new, status: :unprocessable_entity
    end
  end
end

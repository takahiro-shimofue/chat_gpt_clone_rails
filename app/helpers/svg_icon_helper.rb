module SvgIconHelper
  def icon(name)
    icon_path = Rails.root.join("app", "assets", "images", "#{name}.svg")

    raw(File.read(icon_path))
  end
end

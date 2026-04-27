import java.sql.*;

public class RatingDAO {

    private Connection conn;

    public RatingDAO(Connection conn) {
        this.conn = conn;
    }

    public boolean rateTip(int tipId, int userId, int ratingValue) {
        if (ratingValue < 1 || ratingValue > 5) {
            return false;
        }

        String sql = """
            INSERT INTO TipRatings (TipID, UserID, rating_value)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE rating_value = VALUES(rating_value)
        """;

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, tipId);
            stmt.setInt(2, userId);
            stmt.setInt(3, ratingValue);

            stmt.executeUpdate();
            updateTipOwnerPoints(tipId, ratingValue);

            return true;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private void updateTipOwnerPoints(int tipId, int ratingValue) throws SQLException {
        int pointsToAdd = 0;

        if (ratingValue == 5) pointsToAdd = 5;
        else if (ratingValue == 4) pointsToAdd = 3;
        else if (ratingValue == 3) pointsToAdd = 1;

        if (pointsToAdd == 0) return;

        String sql = """
            UPDATE Users
            SET points = points + ?
            WHERE UserID = (
                SELECT UserID FROM Tip WHERE TipID = ?
            )
        """;

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, pointsToAdd);
            stmt.setInt(2, tipId);
            stmt.executeUpdate();
        }
    }
}